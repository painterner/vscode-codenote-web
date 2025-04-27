## CodeNote is a open source code ai assistant extension for vscode web
I have integrate it to my website https://jellyvai.com/codenote, welcom to try!

## Build Prepare
1. Download vscode source code, checkout to 1.98.2 tag
	git checkout 1.98.2
	git checkout -b my-1.98.2

2. prepare patch
	git patch

3.
```bash
	cd extensions
	git clone chat-simple
```

## Run and test (in vscode source root path)
```bash
    npm run watch
	npm run watch-web  # in another terminal
	./scripts/code-web.bat # run in another terminal,  after finished watch and watch-web.
```
open localhost:8080
in web console , enter:
```js
	window.dispatchEvent(new CustomEvent('codeask-res', {
		detail: {
			data: {
				config: {
					BASE_API: 'https://jellyvai.com/api',					// default is my own site
					BASE_GSN_API: 'https://jellyvai.com/api/gsn-bearbeeai', // chat api is: ${BASE_GSN_API}/chat
					SERVICE_NAME: 'bearbeeai',
					NAME_AUTH: "ptxttx-ai-auth-2024-06-02-08-54",
					SITE_EMAIL_NAME: 'JellyVai',
					SITE_OWNER: 'support@jellyvai.com',
					SITE_OWNER_SERVICE: 'support@jellyvai.com'
				},
				profile: {
					avatar: '',
					id: '6686abd35cbd8c01a7658b53',
					email: '935077645@qq.com',
					verified: true,
					token: [your-website-bearer-token] // if use jellyvai service, get the token in https://jellyvai.com/settings oauth-token tab
				},
				window: {
					location: {
						pathname: '/chatnote',
						hostname: 'jellyvai.com'
					}
				}
			}
		}
	}))
```
Why i need this?
Because originally i target the code to embed to existing website, we can pass config by window event dymanically

Enjoy it!

## Deploy
```bash
	npm run gulp vscode-web-ci
	# cd ../vscode-web to check compiled files
	# for test purpose please use my modified code for @vscode/test-web
	node ./scripts/code-web-pt.js
```

## Support
Try my sevice in https://jellyvai.com.
Any issues please post in git.painterner/jellyvai issues.
