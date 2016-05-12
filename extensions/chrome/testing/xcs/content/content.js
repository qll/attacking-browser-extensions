var blob = new Blob(['<script>alert(location.href)</script>'], {type: 'text/html'});
var url = URL.createObjectURL(blob);
var iframe = document.createElement('iframe');
iframe.src = url;
document.body.appendChild(iframe);
