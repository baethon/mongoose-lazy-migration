.PHONY: test
test: .make-setup
	npm test

.PHONY: dummy

test/%.js: .make-setup dummy
	npx ava $@

.PHONY: teardown
teardown:
	docker-compose rm -vfs
	rm .make-*

.make-setup:
	docker-compose up -d
	touch $@
