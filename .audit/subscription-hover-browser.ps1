param([int]$Width=390,[int]$Height=900,[string]$Route='vision',[string]$ExpressionPath,[string]$Screenshot,[string]$StartupPath,[switch]$Trace,[switch]$Exported)
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
$url=([uri](Join-Path (Split-Path $PSScriptRoot) $(if($Exported){'dist/index.html'}else{'index.html'}))).AbsoluteUri+'#'+$Route
Send-CDP 'Page.navigate' @{url=$url} | Out-Null
for($attempt=0;$attempt -lt 30;$attempt++){
  Start-Sleep -Milliseconds 300
  $ready=Send-CDP 'Runtime.evaluate' @{expression='document.readyState === "complete"';returnByValue=$true}
  if($ready.result.value){break}
}
function Evaluate($js){
  $value=Send-CDP 'Runtime.evaluate' @{expression=$js;returnByValue=$true;awaitPromise=$true}
  if($value.exceptionDetails){throw ($value.exceptionDetails|ConvertTo-Json -Depth 10)}
  return $value.result.value
}
Evaluate "applyLanguage('fr');document.querySelector('#subscriptionList').scrollIntoView({behavior:'instant',block:'start'});window.scrollBy(0,-110);" | Out-Null
Start-Sleep -Milliseconds 500
$point=Evaluate "(()=>{const r=document.querySelector('.manage-sub').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()"
Send-CDP 'Input.dispatchMouseEvent' @{type='mouseMoved';x=$point.x;y=$point.y} | Out-Null
Start-Sleep -Milliseconds 350
$scrollBefore=Evaluate 'scrollY'
Send-CDP 'Input.dispatchMouseEvent' @{type='mousePressed';button='left';clickCount=1;x=$point.x;y=$point.y} | Out-Null
Send-CDP 'Input.dispatchMouseEvent' @{type='mouseReleased';button='left';clickCount=1;x=$point.x;y=$point.y} | Out-Null
Start-Sleep -Milliseconds 350
$samples=@()
foreach($selector in @('.manage-menu.open .analysis-sub','.manage-menu.open .pause-sub','.subscription-row:nth-child(2) .manage-sub','.manage-menu.open .cancel-sub','.sub-tabs button','body')){
  $selectorJson=ConvertTo-Json $selector -Compress
  $point=Evaluate "(()=>{const el=document.querySelector($selectorJson);if(!el)return null;const r=el.getBoundingClientRect();return {x:Math.min(innerWidth-2,Math.max(2,r.x+r.width/2)),y:Math.min(innerHeight-2,Math.max(100,r.y+r.height/2))}})()"
  if($point){Send-CDP 'Input.dispatchMouseEvent' @{type='mouseMoved';x=$point.x;y=$point.y} | Out-Null}
  Start-Sleep -Milliseconds 350
  $samples+=Evaluate "(()=>{const r=document.querySelector('.subscription-row'),m=r.querySelector('.manage-menu'),b=r.querySelector('.manage-sub');return {target:$selectorJson,open:m.classList.contains('open'),expanded:b.getAttribute('aria-expanded'),menuRect:m.getBoundingClientRect().toJSON(),rowTransform:getComputedStyle(r).transform,position:getComputedStyle(m).position,hovered:[...document.querySelectorAll(':hover')].at(-1)?.className}})()"
}
$scrollAfter=Evaluate 'scrollY'
$stable=@($samples|Where-Object{!$_.open -or $_.expanded -ne 'true' -or $_.position -ne 'static' -or [Math]::Abs($_.menuRect.y-$samples[0].menuRect.y) -gt 1}).Count -eq 0
$scrollStable=[Math]::Abs($scrollAfter-$scrollBefore) -le 1
@{width=$Width;exported=[bool]$Exported;stable=$stable;scrollStable=$scrollStable;samples=$samples}|ConvertTo-Json -Depth 7 -Compress
if(!$stable -or !$scrollStable){throw 'Menu moved or closed during pointer interaction'}
Evaluate 'document.body.click()' | Out-Null
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



