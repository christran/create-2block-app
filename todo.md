[ ] send email verify with code and a button that automatically confirms the user's email (magic link?)
[ ] move dashboard navbar to /(main)/_compnents?
[ ] account linking needs to do more checks. email is could be different on social account. create separate api (/link/google and /unlink/google)
[ ] whole button is not clickable only text area
[ ] don't allow user to unlinnk account if no password set
[ ] handle if oauth email exists in db but oauth id is not linked to any account.


- notes
- windows firewall inbound port allow 3000
- connectaddress = wsl hostname -I or hostname -I
- netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=192.168.186.138 connectport=3000


file uploading
[ ] generate uuid for file and save it to db along side original file name
[ ] 

[ ] create /packages/auth (already done in create-2block-app repo)