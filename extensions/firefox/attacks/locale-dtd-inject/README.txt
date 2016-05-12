Privilege escalation injecting code from a DTD file.

To see the attack in action do the following:
- Install the language pack on an English or German instance of Firefox
  (or else add your language as a letter code to chrome.manifest)
- Restart the browser to load the new locale
- Visit about:about and see an alert box with /etc/passwd's contents pop up

(Only global/aboutAbout.dtd has been modified.)

For more information read the thesis.