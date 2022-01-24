publish:
	npm publish --dry-run

test:
	npm test

test-watch:
	npm test -- --watchAll

test-coverage:
	npm test -- --coverage --coverageProvider=v8

dev:
	npx webpack serve

install:
	npm ci

build:
	npm list typescript
	tsc --showConfig
	node -v
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npx eslint --no-eslintrc --config .eslintrc.yml .
