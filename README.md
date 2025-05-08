## VSCODE CHATNOTE WEB
This is web code assistant ai powered by vscode web version


## Video
todo

## How to run
```bash
    git clone git@github.com:Jellyvai/vscode-codenote-web.git
    cd vscode-codenote-web
    pnpm i
	npm run compile-web # build web extensions in place
	npm run gulp vscode-web # include build out-build folder and vscode-web-ci, see gulpfile.vscode.web.js
    node ./code-web-pt.js --port 8710 --domain jellyvai.com --protocol https # or replace to your domain
```

will open a http://localhost:8080/vscode-web browser window

before you chat, you need pass some config, open browser console and input:
```js
window.dispatchEvent(new CustomEvent('codeask-res', {
	detail: {
		data: {
			config: {
				BASE_API: 'https://jellyvai.com/api',  // your website api
				BASE_GSN_API: 'https://jellyvai.com/api/gsn-bearbeeai', 
                    //note that chat api url is at /chat subrouter i.e. https://jellyvai.com/api/gsn-bearbeeai/chat
				SERVICE_NAME: 'bearbeeai', // required if use jellyvai backend
				SITE_EMAIL_NAME: 'JellyVai', // required if use jellyvai backend
				SITE_OWNER: 'support@jellyvai.com', // required if use jellyvai backend
				SITE_OWNER_SERVICE: 'support@jellyvai.com'// required if use jellyvai backend
			},
			profile: {
				avatar: '',
				id: '6686abd35cbd8c01a7658b53',
				email: '935077645@qq.com',
				verified: true,
				token: <your_website_token> // if you use jellyvai BASE_API, you can get token in https://jellyvai.com/settings/oauth tab
			},
			window: {
				location: {
					pathname: '/chatnote',  // frontend sub router, i.e.  protocol://host:port/vscode-web/chatnote
					hostname: 'jellyvai.com' // your host name
				}
			}
		}
	}
}))
```

Enjoy it !


## How to build 
```bash
    git clone <vscode_repository>
    git checkout 1.99.2
    git checkout -b my_1.99.2
    git patch ./patch.txt

    cd vscode
    npm i
    npm run gulp vscode-web-ci
```

put the build folder `vscode-web`(in the same folder as vscode repository) to vscode-chatnote-web repository and run regulary.

## LICENSE
MIT