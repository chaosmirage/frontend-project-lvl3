publish:
	npm publish --dry-run

test:
	npm test

test-watch:
	npm test -- --watchAll

test-coverage:
	npm test -- --coverage --coverageProvider=v8

dev:
	npx webpack serve --config ./webpack.dev.js

install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint --no-eslintrc --config .eslintrc.yml .
