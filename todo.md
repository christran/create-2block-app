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

[ ] ui package (https://github.com/search?q=repo%3At3-oss%2Fcreate-t3-turbo+tailwind-merge&type=code)
[ ] figure out why npx turbo daemon clean is needed everytime
[ ] fix trigger and uncomment any code related (email.ts, actions.ts, user.procedure)
[ ] add expo
[ ] update github workflows
[ ] build time error:  ../../packages/auth/src/validate-request.ts
    Error: 
    x You're importing a component that needs next/headers. That only works in a Server Component which is not supported in the pages/ directory. Read more: https://nextjs.org/docs/getting-started/
    | react-essentials#server-components