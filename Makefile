install:
	npm install

publish:
	npm publish --dry-run

lint:
	npx eslint --no-eslintrc --config .eslintrc.yml .

test:
	npm test

test-watch:
	npm test -- --watchAll

test-coverage:
	npm test -- --coverage --coverageProvider=v8
