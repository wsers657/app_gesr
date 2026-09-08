param([int]$Width=390,[int]$Height=900,[string]$Route='vision',[string]$ExpressionPath,[string]$Screenshot,[string]$StartupPath,[switch]$Trace)
$ErrorActionPreference='Stop'
$target=(Invoke-WebRequest 'http://localhost:9223/json/new?about:blank' -Method Put -UseBasicParsing).Content | ConvertFrom-Json
Start-Sleep -Milliseconds 300
$socket=New-Object System.Net.WebSockets.ClientWebSocket
$socket.ConnectAsync([uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
$script:messageId=0
function Send-CDP($method,$parameters){
  if($Trace){Write-Host $method}
  $deadline=New-Object Threading.CancellationTokenSource
  $deadline.CancelAfter(15000)
  $script:messageId++
  $bytes=[Text.Encoding]::UTF8.GetBytes((@{id=$script:messageId;method=$method;params=$parameters}|ConvertTo-Json -Depth 30 -Compress))
  $socket.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  do {
    $stream=New-Object IO.MemoryStream
    do {
      $buffer=New-Object byte[] 65536
      $read=$socket.ReceiveAsync([ArraySegment[byte]]::new($buffer),$deadline.Token).GetAwaiter().GetResult()
      $stream.Write($buffer,0,$read.Count)
    } while(!$read.EndOfMessage)
    $message=[Text.Encoding]::UTF8.GetString($stream.ToArray())|ConvertFrom-Json
    $stream.Dispose()
  } while($message.id -ne $script:messageId)
  if($message.error){throw ($method + ': ' + ($message.error|ConvertTo-Json))}
  $deadline.Dispose()
  return $message.result
}
Send-CDP 'Page.enable' @{} | Out-Null
Send-CDP 'Emulation.setDeviceMetricsOverride' @{width=$Width;height=$Height;deviceScaleFactor=1;mobile=$false} | Out-Null
Send-CDP 'Network.enable' @{} | Out-Null
Send-CDP 'Network.setBlockedURLs' @{urls=@('*fonts.googleapis.com*','*fonts.gstatic.com*')} | Out-Null
Send-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source='window.__auditErrors=[];addEventListener("error",e=>__auditErrors.push(e.message));addEventListener("unhandledrejection",e=>__auditErrors.push(String(e.reason)));'} | Out-Null
if($StartupPath){$startup=Send-CDP 'Page.addScriptToEvaluateOnNewDocument' @{source=[IO.File]::ReadAllText((Resolve-Path -LiteralPath $StartupPath).Path)}}
$url=([uri](Join-Path (Split-Path $PSScriptRoot) 'index.html')).AbsoluteUri+'#'+$Route
Send-CDP 'Page.navigate' @{url=$url} | Out-Null
for($attempt=0;$attempt -lt 30;$attempt++){
  Start-Sleep -Milliseconds 300
  $ready=Send-CDP 'Runtime.evaluate' @{expression='document.readyState === "complete"';returnByValue=$true}
  if($ready.result.value){break}
}
$expression=if($ExpressionPath){Get-Content -LiteralPath $ExpressionPath -Raw -Encoding UTF8}else{'JSON.stringify({width:innerWidth,body:document.body.getBoundingClientRect().width,scroll:document.documentElement.scrollWidth,title:document.title})'}
$result=Send-CDP 'Runtime.evaluate' @{expression="JSON.stringify($expression)";returnByValue=$true}
if($result.exceptionDetails){$result | ConvertTo-Json -Depth 30 -Compress}else{$result.result.value}
if($Screenshot){
  Start-Sleep -Milliseconds 700
  $capture=Send-CDP 'Page.captureScreenshot' @{format='png';captureBeyondViewport=$false}
  [IO.File]::WriteAllBytes($Screenshot,[Convert]::FromBase64String($capture.data))
}
if($startup){Send-CDP 'Page.removeScriptToEvaluateOnNewDocument' @{identifier=$startup.identifier} | Out-Null}
$socket.Dispose()
Invoke-WebRequest "http://localhost:9223/json/close/$($target.id)" -UseBasicParsing | Out-Null
