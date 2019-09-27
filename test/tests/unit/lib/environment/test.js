const TwingTestMockEnvironment = require('../../../../mock/environment');
const {
    TwingEnvironment,
    TwingLoaderFilesystem,
    TwingCacheNull,
    TwingTemplate,
    TwingParser,
    TwingLexer,
    TwingErrorSyntax,
    TwingLoaderArray,
    TwingSource,
    TwingCacheFilesystem,
    TwingFilter,
    TwingFunction,
    TwingTest,
    TwingTokenParser,
    TwingExtension,
    TwingErrorRuntime,
    TwingOperator,
    TwingOperatorType,
    TwingNodeType
} = require('../../../../../dist/cjs/main');

const TwingTestMockLoader = require('../../../../mock/loader');
const TwingTestMockCache = require('../../../../mock/cache');
const TwingTestMockTemplate = require('../../../../mock/template');
const {SourceMapConsumer} = require('source-map');
const {Token, TokenType} = require('twig-lexer');

const tap = require('tape');
const sinon = require('sinon');
const tmp = require('tmp');
const {join} = require('path');
const {readFileSync} = require('fs');

function escapingStrategyCallback(name) {
    return name;
}

class TwingTestsEnvironmentTestTokenParser extends TwingTokenParser {
    parse(token) {
    }

    getTag() {
        return 'test';
    }
}

class TwingTestsEnvironmentTestNodeVisitor {
    enterNode(node, env) {
        return node;
    }

    leaveNode(node, env) {
        return node;
    }

    getPriority() {
        return 0;
    }
}

class TwingTestsEnvironmentTestExtension extends TwingExtension {
    constructor() {
        super();
    }

    getTokenParsers() {
        return [
            new TwingTestsEnvironmentTestTokenParser(),
        ];
    }

    getNodeVisitors() {
        return [
            new TwingTestsEnvironmentTestNodeVisitor(),
        ];
    }

    getFilters() {
        return [
            new TwingFilter('foo_filter')
        ];
    }

    getTests() {
        return [
            new TwingTest('foo_test'),
        ];
    }

    getFunctions() {
        return [
            new TwingFunction('foo_function'),
        ];
    }

    getOperators() {
        return [
            new TwingOperator('foo_unary', TwingOperatorType.UNARY, 10, () => {}),
            new TwingOperator('foo_binary', TwingOperatorType.BINARY, 10, () => {}),
        ];
    }
}

class TwingTestsEnvironmentTestExtensionRegression extends TwingTestsEnvironmentTestExtension {
    getFilters() {
        return [
            new TwingFilter('foo_filter')
        ];
    }

    getFunctions() {
        return [
            new TwingFunction('foo_function')
        ];
    }
}

class TwingTestsEnvironmentParserBar extends TwingParser {
    parse(stream, test, dropNeedle) {
        return 'bar';
    }
}

class TwingTestsEnvironmentLexerBar extends TwingLexer {
    tokenize(source) {
        return [new Token(TokenType.TEXT, 'bar', 1, 1)];
    }
}

class TwingTestsEnvironmentParserError extends TwingParser {
    parse(stream, test, dropNeedle) {
        throw new Error('Parser error "foo".');
    }
}

function getMockLoader(templateName, templateContent) {
    let loader = new TwingTestMockLoader();

    sinon.stub(loader, 'getSourceContext').withArgs(templateName).returns(new TwingSource(templateContent, templateName));
    sinon.stub(loader, 'getCacheKey').withArgs(templateName).returns(templateName);

    return loader;
}

tap.test('environment', function (test) {
    test.test('autoescapeOption', function (test) {
        let loader = new TwingLoaderArray({
            'html': '{{ foo }} {{ foo }}',
            'js': '{{ bar }} {{ bar }}',
        });

        let twing = new TwingEnvironment(loader, {
            debug: true,
            cache: false,
            autoescape: escapingStrategyCallback
        });

        test.same(twing.render('html', {'foo': 'foo<br/ >'}), 'foo&lt;br/ &gt; foo&lt;br/ &gt;');
        test.same(twing.render('js', {'bar': 'foo<br/ >'}), 'foo\\u003Cbr\\/\\u0020\\u003E foo\\u003Cbr\\/\\u0020\\u003E');

        test.end();
    });

    test.test('globals', function (test) {
        let loader = new TwingTestMockLoader();
        sinon.stub(loader, 'getSourceContext').returns(new TwingSource('', ''));

        // globals can be added after calling getGlobals
        let twing = new TwingEnvironment(loader);
        twing.addGlobal('foo', 'foo');
        twing.getGlobals();
        twing.addGlobal('foo', 'bar');
        let globals = twing.getGlobals();
        test.same(globals.get('foo'), 'bar');

        // globals can be modified after a template has been loaded
        twing = new TwingEnvironment(loader);
        twing.addGlobal('foo', 'foo');
        twing.getGlobals();
        twing.loadTemplate('index');
        twing.addGlobal('foo', 'bar');
        globals = twing.getGlobals();
        test.same(globals.get('foo'), 'bar');

        // globals can be modified after extensions init
        twing = new TwingEnvironment(loader);
        twing.addGlobal('foo', 'foo');
        twing.getGlobals();
        twing.getFunctions();
        twing.addGlobal('foo', 'bar');
        globals = twing.getGlobals();
        test.same(globals.get('foo'), 'bar');

        // globals can be modified after extensions and a template has been loaded
        let arrayLoader = new TwingLoaderArray({index: '{{foo}}'});
        twing = new TwingEnvironment(arrayLoader);
        twing.addGlobal('foo', 'foo');
        twing.getGlobals();
        twing.getFunctions();
        twing.loadTemplate('index');
        twing.addGlobal('foo', 'bar');
        globals = twing.getGlobals();
        test.same(globals.get('foo'), 'bar');

        twing = new TwingEnvironment(arrayLoader);
        twing.getGlobals();
        twing.addGlobal('foo', 'bar');
        let template = twing.loadTemplate('index');
        test.same(template.render({}), 'bar');

        // globals cannot be added after a template has been loaded
        twing = new TwingEnvironment(loader);
        twing.addGlobal('foo', 'foo');
        twing.getGlobals();
        twing.addGlobal('foo', 'bar');
        twing.loadTemplate('index');
        try {
            twing.addGlobal('bar', 'bar');
            test.fail();
        } catch (e) {
            test.false(twing.getGlobals()['bar']);
        }

        // globals cannot be added after extensions init
        twing = new TwingEnvironment(loader);
        twing.addGlobal('foo', 'foo');
        twing.getGlobals();
        twing.getFunctions();
        try {
            twing.addGlobal('bar', 'bar');
            test.fail();
        } catch (e) {
            test.false(twing.getGlobals()['bar']);
        }

        // globals cannot be added after extensions and a template has been loaded
        twing = new TwingEnvironment(loader);
        twing.addGlobal('foo', 'foo');
        twing.getGlobals();
        twing.getFunctions();
        twing.loadTemplate('index');
        try {
            twing.addGlobal('bar', 'bar');
            test.fail();
        } catch (e) {
            test.false(twing.getGlobals()['bar']);
        }

        // test adding globals after a template has been loaded without call to getGlobals
        twing = new TwingEnvironment(loader);
        twing.loadTemplate('index');
        try {
            twing.addGlobal('bar', 'bar');
            test.fail();
        } catch (e) {
            test.false(twing.getGlobals()['bar']);
        }

        test.end();
    });

    test.test('testExtensionsAreNotInitializedWhenRenderingACompiledTemplate', function (test) {
        let cache = new TwingCacheFilesystem(tmp.dirSync().name);
        let options = {cache: cache, auto_reload: false, debug: false};

        // force compilation
        let loader = new TwingLoaderArray({index: '{{ foo }}'});
        let twing = new TwingEnvironment(loader, options);

        let key = cache.generateKey('index', twing.getTemplateHash('index'));
        cache.write(key, twing.compileSource(new TwingSource('{{ foo }}', 'index')));

        // check that extensions won't be initialized when rendering a template that is already in the cache
        twing = new TwingTestMockEnvironment(loader, options);
        twing['initExtensions'] = () => {
        };
        sinon.stub(twing, 'initExtensions');
        sinon.assert.notCalled(twing['initExtensions']);

        // render template
        let output = twing.render('index', {foo: 'bar'});
        test.same(output, 'bar');

        test.end();
    });

    test.test('autoReloadCacheMiss', function (test) {
        let templateName = test.name;
        let templateContent = test.name;

        let cache = new TwingTestMockCache();
        let loader = getMockLoader(templateName, templateContent);
        let twing = new TwingTestMockEnvironment(loader, {cache: cache, auto_reload: true, debug: false});

        sinon.stub(cache, 'generateKey').returns('key');
        sinon.stub(cache, 'getTimestamp').returns(0);
        let writeSpy = sinon.spy(cache, 'write');
        let loadSpy = sinon.spy(cache, 'load');
        sinon.stub(loader, 'isFresh').returns(false);

        twing.loadTemplate(templateName);

        sinon.assert.calledOnce(cache['generateKey']);
        sinon.assert.calledOnce(cache['getTimestamp']);
        sinon.assert.calledOnce(loader['isFresh']);

        test.same(writeSpy.callCount, 1);
        test.same(loadSpy.callCount, 1);

        test.end();
    });

    test.test('autoReloadCacheHit', function (test) {
        let templateName = test.name;
        let templateContent = test.name;

        let cache = new TwingTestMockCache();
        let loader = getMockLoader(templateName, templateContent);
        let twing = new TwingTestMockEnvironment(loader, {cache: cache, auto_reload: true, debug: false});

        let generateKeyStub = sinon.stub(cache, 'generateKey').returns('key');
        let getTimestampStub = sinon.stub(cache, 'getTimestamp').returns(0);
        let writeSpy = sinon.spy(cache, 'write');
        let loadSpy = sinon.spy(cache, 'load');
        let isFreshStub = sinon.stub(loader, 'isFresh').returns(true);

        twing.loadTemplate(templateName);

        test.same(generateKeyStub.callCount, 1, 'generateKey should be called once');
        test.same(getTimestampStub.callCount, 1, 'getTimestamp should be called once');
        test.same(isFreshStub.callCount, 1, 'isFresh should be called once');
        test.same(writeSpy.callCount, 0, 'write should not be called');
        test.true(loadSpy.callCount >= 1, 'load should be called at least once');

        test.end();
    });

    test.test('autoReloadOutdatedCacheHit', function (test) {
        let templateName = test.name;
        let templateContent = test.name;

        let cache = new TwingTestMockCache();
        let loader = getMockLoader(templateName, templateContent);
        let twing = new TwingTestMockEnvironment(loader, {cache: cache, auto_reload: true, debug: false});

        let now = new Date();

        sinon.stub(cache, 'generateKey').returns('key');
        sinon.stub(cache, 'getTimestamp').returns(now);
        let writeSpy = sinon.spy(cache, 'write');
        let loadSpy = sinon.spy(cache, 'load');
        sinon.stub(loader, 'isFresh').returns(false);

        twing.loadTemplate(templateName);

        sinon.assert.calledOnce(cache['generateKey']);
        sinon.assert.calledOnce(cache['getTimestamp']);
        sinon.assert.calledOnce(loader['isFresh']);

        test.same(writeSpy.callCount, 1, 'write should be called once');
        test.same(loadSpy.callCount, 1, 'load should be called once');

        test.end();
    });

    test.test('sourceMapChangeCacheMiss', function (test) {
        let templateName = test.name;
        let templateContent = test.name;

        let cache = new TwingTestMockCache();
        let loader = getMockLoader(templateName, templateContent);
        let twing = new TwingEnvironment(loader, {
            cache: cache,
            source_map: true
        });

        let firstKey = null;
        let secondKey = null;

        sinon.stub(cache, 'generateKey').callsFake((name, className) => {
            return className;
        });
        sinon.stub(cache, 'load').callsFake((key) => {
            if (firstKey) {
                secondKey = key;
            } else {
                firstKey = key;
            }

            return () => {
                return new Map();
            }
        });

        twing.loadTemplate(templateName);

        twing = new TwingEnvironment(loader, {
            cache: cache,
            source_map: false
        });

        twing.loadTemplate(templateName);

        test.notEquals(firstKey, secondKey);

        test.end();
    });

    test.test('autoescapeChangeCacheMiss', function (test) {
        let templateName = test.name;
        let templateContent = test.name;

        let cache = new TwingTestMockCache();
        let loader = getMockLoader(templateName, templateContent);
        let twing = new TwingEnvironment(loader, {
            cache: cache,
            autoescape: 'html'
        });

        let firstKey = null;
        let secondKey = null;

        sinon.stub(cache, 'generateKey').callsFake((name, className) => {
            return className;
        });
        sinon.stub(cache, 'load').callsFake((key) => {
            if (firstKey) {
                secondKey = key;
            } else {
                firstKey = key;
            }

            return () => {
                return new Map()

            }
        });

        twing.loadTemplate(templateName);

        twing = new TwingEnvironment(loader, {
            cache: cache,
            autoescape: false
        });

        twing.loadTemplate(templateName);

        test.notEquals(firstKey, secondKey);

        test.end();
    });

    test.test('addExtension', function (test) {
        let twing = new TwingEnvironment(new TwingTestMockLoader());
        let ext = new TwingTestsEnvironmentTestExtension();

        twing.addExtension(ext, 'TwingTestsEnvironmentTestExtension');

        test.true(twing.hasExtension('TwingTestsEnvironmentTestExtension'));
        test.true(twing.getTags().has('test'));
        test.true(twing.getFilters().has('foo_filter'));
        test.true(twing.getFunctions().has('foo_function'));
        test.true(twing.getTests().has('foo_test'));
        test.true(twing.getUnaryOperators().has('foo_unary'));
        test.true(twing.getBinaryOperators().has('foo_binary'));

        let visitors = twing.getNodeVisitors();
        let found = false;

        for (let visitor of visitors) {
            if (visitor instanceof TwingTestsEnvironmentTestNodeVisitor) {
                found = true;
            }
        }

        test.true(found);

        test.test('with explicit name', (test) => {
            let twing = new TwingEnvironment(new TwingTestMockLoader());
            let ext1 = new TwingTestsEnvironmentTestExtension();
            let ext2 = new TwingTestsEnvironmentTestExtension();

            twing.addExtension(ext1, 'ext1');
            twing.addExtension(ext2, 'ext2');

            test.equals(twing.getExtension('ext1'), ext1);
            test.equals(twing.getExtension('ext2'), ext2);

            test.end();
        });

        test.test('support pre-1.2.0 API', (test) => {
            let twing = new TwingEnvironment(new TwingTestMockLoader());
            let ext = new TwingTestsEnvironmentTestExtensionRegression();
            twing.addExtension(ext);

            test.true(twing.getFilters().has('foo_filter'));
            test.true(twing.getFunctions().has('foo_function'));

            test.end();
        });

        test.end();
    });

    test.test('addMockExtension', function (test) {
        let extension = sinon.mock(TwingExtension).object;

        let loader = new TwingLoaderArray({page: 'hey'});

        let twing = new TwingEnvironment(loader);
        twing.addExtension(extension, 'foo');

        test.same(twing.getExtension('foo').name, 'TwingExtension');
        test.true(twing.isTemplateFresh('page', new Date().getTime(), null));

        test.end();
    });

    test.test('overrideExtension', function (test) {
        let twing = new TwingEnvironment(new TwingLoaderArray({}));

        twing.addExtension(new TwingTestsEnvironmentTestExtension(), 'TwingTestsEnvironmentTestExtension');

        try {
            twing.addExtension(new TwingTestsEnvironmentTestExtension(), 'TwingTestsEnvironmentTestExtension');

            test.fail();
        }
        catch (e) {
            test.same(e.message, 'Unable to register extension "TwingTestsEnvironmentTestExtension" as it is already registered.')
        }

        test.end();
    });

    test.test('failLoadTemplate', function (test) {
        let template = 'testFailLoadTemplate.twig';
        let twing = new TwingEnvironment(new TwingLoaderArray({'testFailLoadTemplate.twig': false}));

        test.throws(function () {
            twing.loadTemplate(template, 'abc');
        }, new TwingErrorRuntime('Failed to load Twig template "testFailLoadTemplate.twig", index "abc": cache is corrupted.', -1, new TwingSource(false, 'testFailLoadTemplate.twig')));

        test.end();
    });

    test.test('debug', function (test) {
        let env = new TwingEnvironment(new TwingTestMockLoader(), {
            debug: false
        });

        let templateClass = env.getTemplateHash('foo');

        test.test('enable', function (test) {
            env.enableDebug();

            test.true(env.isDebug());
            test.notSame(env.getTemplateHash('foo'), templateClass);
            test.end();
        });

        test.test('disable', function (test) {
            env.disableDebug();

            test.false(env.isDebug());
            test.same(env.getTemplateHash('foo'), templateClass);
            test.end();
        });

        test.end();
    });

    test.test('autoreload', function (test) {
        let env = new TwingEnvironment(new TwingTestMockLoader(), {
            auto_reload: false
        });

        test.test('enable', function (test) {
            env.enableAutoReload();

            test.true(env.isAutoReload());
            test.end();
        });

        test.test('disable', function (test) {
            env.disableAutoReload();

            test.false(env.isAutoReload());
            test.end();
        });


        test.end();
    });

    test.test('strict_variables', function (test) {
        let env = new TwingEnvironment(new TwingTestMockLoader(), {
            strict_variables: false
        });

        let templateClass = env.getTemplateHash('foo');

        test.test('enable', function (test) {
            env.enableStrictVariables();

            test.true(env.isStrictVariables());
            test.notSame(env.getTemplateHash('foo'), templateClass);
            test.end();
        });

        test.test('disable', function (test) {
            env.disableStrictVariables();

            test.false(env.isStrictVariables());
            test.same(env.getTemplateHash('foo'), templateClass);
            test.end();
        });

        test.end();
    });

    test.test('cache', function (test) {
        test.test('set', function (test) {
            let env = new TwingEnvironment(new TwingTestMockLoader(), {
                cache: false
            });

            env.setCache('bar');

            test.same(env.getCache(), 'bar');
            test.true(env.getCache(false) instanceof TwingCacheFilesystem);

            env.setCache(new TwingTestMockCache());

            test.true(env.getCache(false) instanceof TwingTestMockCache);

            test.throws(function () {
                env.setCache({});
            }, new Error('Cache can only be a string, false, or a TwingCacheInterface implementation.'));

            test.end();
        });

        test.end();
    });

    test.test('display', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'bar'
        }));

        let data;
        let originalWrite = process.stdout.write;

        process.stdout.write = function (chunk) {
            data = chunk;

            process.stdout.write = originalWrite;

            test.same(data, 'bar');
            test.end();
        };

        env.display('index');
    });

    test.test('load', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'bar'
        }));

        let template = new TwingTestMockTemplate();

        test.true(env.load(template));
        test.true(env.load('index'));

        test.end();
    });

    test.test('loadTemplate', function (test) {
        let env = new TwingTestMockEnvironment(new TwingLoaderArray({index: 'foo'}), {
            cache: new TwingTestMockCache()
        });

        let template = env.loadTemplate('index');

        test.true(template instanceof TwingTestMockTemplate);

        test.end();
    });

    test.test('resolveTemplate', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: '{{ foo'
        }));

        test.throws(function () {
            env.resolveTemplate('index');
        }, new TwingErrorSyntax('Unexpected token "end of template" of value "null" ("end of print statement" expected).', 1, new TwingSource('{{ foo', 'index', '')));

        test.throws(function () {
            env.resolveTemplate('missing');
        }, new Error('Template "missing" is not defined.'));

        test.end();
    });

    test.test('parser', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'foo'
        }));

        env.setParser(new TwingTestsEnvironmentParserBar(env));

        test.same(env.parse(env.tokenize(new TwingSource('foo', 'index', ''))), 'bar');

        test.end();
    });

    test.test('lexer', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'foo'
        }));

        env.setLexer(new TwingTestsEnvironmentLexerBar(env));

        test.true(env.tokenize(new TwingSource('foo', 'index', '')).getCurrent().test(TokenType.TEXT, 'bar'));

        test.end();
    });

    test.test('compileSource', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'foo'
        }));

        let source = new TwingSource('{{ foo', 'index', '');

        try {
            env.compileSource(source);

            test.fail();
        }
        catch (e) {
            test.same(e.message, 'Unclosed variable opened at {1:1} in "index" at line 1.');
        }

        env.setParser(new TwingTestsEnvironmentParserError(env));

        source = new TwingSource('{{ foo.bar }}', 'index', '');

        try {
            env.compileSource(source);

            test.fail();
        }
        catch (e) {
            test.same(e.message, 'An exception has been thrown during the compilation of a template ("Parser error "foo".") in "index".');
        }

        test.end();
    });

    test.test('extensions', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'foo'
        }));

        let extension = new TwingTestsEnvironmentTestExtension();

        env.addExtensions(new Map([['TwingTestsEnvironmentTestExtension', extension]]));

        test.true(env.getExtensions().has('TwingTestsEnvironmentTestExtension'));

        test.end();
    });

    test.test('nodeVisitors', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'foo'
        }));

        let nodeVisitor = new TwingTestsEnvironmentTestNodeVisitor();

        env.addNodeVisitor(nodeVisitor);

        test.true(env.getNodeVisitors().includes(nodeVisitor));

        test.end();
    });

    test.test('undefinedFilterCallbacks', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'foo'
        }));

        let fakeFilter = {};

        let cb = (name) => {
            return fakeFilter;
        };

        env.registerUndefinedFilterCallback(cb);

        test.same(env.getFilter('fake'), fakeFilter);

        test.end();
    });

    test.test('undefinedFunctionCallbacks', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            index: 'foo'
        }));

        let fakeFunction = {};

        let cb = (name) => {
            return fakeFunction;
        };

        env.registerUndefinedFunctionCallback(cb);

        test.same(env.getFunction('fake'), fakeFunction);

        test.end();
    });

    test.test('should emit events', (test) => {
        test.test('template', (test) => {
            let env = new TwingEnvironment(new TwingLoaderArray({
                index: '{% include "foo" %}',
                foo: 'Foo'
            }), {
                cache: 'tmp/rftg'
            });

            let templates = [];

            env.on('template', (name) => {
                templates.push(name);
            });

            env.render('index');

            test.same(templates, [
                'index',
                'foo'
            ]);

            test.end();
        });

        test.end();
    });

    test.test('source map support', (test) => {
        let fixturesPath = 'test/tests/unit/lib/environment/fixtures';

        let loader = new TwingLoaderFilesystem(fixturesPath);
        loader.addPath(join(fixturesPath, 'css'), 'Css');

        let indexSource = join(fixturesPath, 'css', 'index.css.twig');
        let colorSource = join(fixturesPath, 'css', 'partial/color.css.twig');
        let backgroundSource = join(fixturesPath, 'css', 'partial/background.css.twig');

        test.test('when source_map is set to true', (test) => {
            let env = new TwingEnvironment(loader, {
                source_map: true
            });

            // 1.foo {
            // 2    text-align: right;
            // 3    color: whitesmoke;
            // 4    background-color: brown;
            // 5background-image: url("foo.png");
            // 6    display: block;
            // 7}

            env.render('css/index.css.twig', {
                align: 'right'
            });

            let map = env.getSourceMap();

            test.same(typeof map, 'string');

            let consumer = new SourceMapConsumer(map);

            let mappings = [];

            consumer.eachMapping((mapping) => {
                mappings.push({
                    source: mapping.source,
                    generatedLine: mapping.generatedLine,
                    generatedColumn: mapping.generatedColumn,
                    originalLine: mapping.originalLine,
                    originalColumn: mapping.originalColumn,
                    name: mapping.name
                });
            });

            let sourceContent = consumer.sourceContentFor(indexSource, true);

            test.same(sourceContent, readFileSync(indexSource, 'UTF-8'));

            test.same(
                mappings,
                [
                    {
                        source: indexSource,
                        generatedLine: 1,
                        generatedColumn: 0,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 2,
                        generatedColumn: 0,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 2,
                        generatedColumn: 16,
                        originalLine: 2,
                        originalColumn: 16,
                        name: 'print'
                    },
                    {
                        source: indexSource,
                        generatedLine: 2,
                        generatedColumn: 21,
                        originalLine: 2,
                        originalColumn: 27,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 3,
                        generatedColumn: 0,
                        originalLine: 2,
                        originalColumn: 27,
                        name: 'text'
                    },
                    {
                        source: colorSource,
                        generatedLine: 3,
                        generatedColumn: 11,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 3,
                        generatedColumn: 21,
                        originalLine: 3,
                        originalColumn: 53,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 4,
                        generatedColumn: 0,
                        originalLine: 3,
                        originalColumn: 53,
                        name: 'text'
                    },
                    {
                        source: backgroundSource,
                        generatedLine: 4,
                        generatedColumn: 4,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: backgroundSource,
                        generatedLine: 5,
                        generatedColumn: 0,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 6,
                        generatedColumn: 0,
                        originalLine: 5,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 7,
                        generatedColumn: 0,
                        originalLine: 5,
                        originalColumn: 0,
                        name: 'text'
                    }
                ]
            );

            test.end();
        });

        test.test('when source_map is set to false', (test) => {
            let env = new TwingEnvironment(loader, {
                source_map: false
            });

            env.render('css/index.css.twig', {
                align: 'right'
            });

            let map = env.getSourceMap();

            test.equals(map, null);

            test.end();
        });

        test.test('when source_map is a string', (test) => {
            let env = new TwingEnvironment(loader, {
                source_map: 'foo'
            });

            // 1.foo {
            // 2    text-align: right;
            // 3    color: whitesmoke;
            // 4    background-color: brown;
            // 5background-image: url("foo.png");
            // 6    display: block;
            // 7}

            env.render('css/index.css.twig', {
                align: 'right'
            });

            let map = env.getSourceMap();

            test.same(typeof map, 'string');

            indexSource = 'foo/' + indexSource;
            colorSource = 'foo/' + colorSource;
            backgroundSource = 'foo/' + backgroundSource;

            let consumer = new SourceMapConsumer(map);

            let mappings = [];

            consumer.eachMapping((mapping) => {
                mappings.push({
                    source: mapping.source,
                    generatedLine: mapping.generatedLine,
                    generatedColumn: mapping.generatedColumn,
                    originalLine: mapping.originalLine,
                    originalColumn: mapping.originalColumn,
                    name: mapping.name
                });
            });

            test.same(
                mappings,
                [
                    {
                        source: indexSource,
                        generatedLine: 1,
                        generatedColumn: 0,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 2,
                        generatedColumn: 0,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 2,
                        generatedColumn: 16,
                        originalLine: 2,
                        originalColumn: 16,
                        name: 'print'
                    },
                    {
                        source: indexSource,
                        generatedLine: 2,
                        generatedColumn: 21,
                        originalLine: 2,
                        originalColumn: 27,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 3,
                        generatedColumn: 0,
                        originalLine: 2,
                        originalColumn: 27,
                        name: 'text'
                    },
                    {
                        source: colorSource,
                        generatedLine: 3,
                        generatedColumn: 11,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 3,
                        generatedColumn: 21,
                        originalLine: 3,
                        originalColumn: 53,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 4,
                        generatedColumn: 0,
                        originalLine: 3,
                        originalColumn: 53,
                        name: 'text'
                    },
                    {
                        source: backgroundSource,
                        generatedLine: 4,
                        generatedColumn: 4,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: backgroundSource,
                        generatedLine: 5,
                        generatedColumn: 0,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 6,
                        generatedColumn: 0,
                        originalLine: 5,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: indexSource,
                        generatedLine: 7,
                        generatedColumn: 0,
                        originalLine: 5,
                        originalColumn: 0,
                        name: 'text'
                    }
                ]
            );

            test.end();
        });

        test.test('handle templates compiled without source map support', (test) => {
            class CustomTemplate extends TwingTemplate {
                getTemplateName() {
                    return 'foo';
                }

                doDisplay() {

                }
            }

            class CustomCache extends TwingCacheNull {
                generateKey(name, className) {
                    return className;
                }

                load(key) {
                    return () => {
                        return new Map([
                            [0, CustomTemplate]
                        ]);
                    };
                }
            }

            let env = new TwingEnvironment(loader, {
                source_map: true,
                cache: new CustomCache()
            });

            env.render('css/index.css.twig');

            let sourceMap = env.getSourceMap();

            test.false(sourceMap);
            test.end();
        });

        test.test('with spaceless tag', (test) => {
            let env = new TwingEnvironment(loader, {
                source_map: true
            });

            indexSource = join(fixturesPath, 'spaceless', 'index.html.twig');

            // 1.foo
            // 2.<foo></foo>
            // 3.bar
            // 5.    <foo><FOO>FOO
            // 5.BAROOF</FOO></foo>oof

            let render = env.render('spaceless/index.html.twig', {
                bar: 'bar'
            });

            test.same(render, `foo
<foo></foo>
bar
    <foo><FOO>FOO
BAROOF</FOO></foo>oof`);

            let map = env.getSourceMap();

            test.same(typeof map, 'string');

            let consumer = new SourceMapConsumer(map);


            let mappings = [];

            consumer.eachMapping((mapping) => {
                mappings.push({
                    source: mapping.source,
                    generatedLine: mapping.generatedLine,
                    generatedColumn: mapping.generatedColumn,
                    originalLine: mapping.originalLine,
                    originalColumn: mapping.originalColumn,
                    name: mapping.name
                });
            });

            test.same(
                mappings,
                [
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/index.html.twig',
                        generatedLine: 1,
                        generatedColumn: 0,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/index.html.twig',
                        generatedLine: 2,
                        generatedColumn: 0,
                        originalLine: 3,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/index.html.twig',
                        generatedLine: 3,
                        generatedColumn: 0,
                        originalLine: 6,
                        originalColumn: 0,
                        name: 'print'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/index.html.twig',
                        generatedLine: 3,
                        generatedColumn: 3,
                        originalLine: 6,
                        originalColumn: 9,
                        name: 'text'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/index.html.twig',
                        generatedLine: 4,
                        generatedColumn: 0,
                        originalLine: 6,
                        originalColumn: 9,
                        name: 'text'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/partials/foo.html.twig',
                        generatedLine: 4,
                        generatedColumn: 9,
                        originalLine: 1,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/partials/foo.html.twig',
                        generatedLine: 5,
                        generatedColumn: 0,
                        originalLine: 3,
                        originalColumn: 4,
                        name: 'print'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/partials/foo.html.twig',
                        generatedLine: 5,
                        generatedColumn: 3,
                        originalLine: 5,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/index.html.twig',
                        generatedLine: 5,
                        generatedColumn: 12,
                        originalLine: 9,
                        originalColumn: 0,
                        name: 'text'
                    },
                    {
                        source: 'test/tests/unit/lib/environment/fixtures/spaceless/index.html.twig',
                        generatedLine: 5,
                        generatedColumn: 18,
                        originalLine: 11,
                        originalColumn: 0,
                        name: 'text'
                    }
                ]
            );

            test.end();
        });

        test.end();
    });

    test.test('createTemplate', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({}));

        let template = env.createTemplate('foo');

        test.same(template.getTemplateName(), '__string_template__2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');

        template = env.createTemplate('foo', 'foo.twig');

        test.same(template.getTemplateName(), 'foo.twig (string template 2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae)');

        test.end();
    });

    test.test('registerTemplatesModule', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({
            foo: ''
        }));

        let loaderSpy = sinon.spy(env.getLoader(), 'getSourceContext');
        let cacheSpy = sinon.spy(env.getCache(false), 'generateKey');

        env.registerTemplatesModule((c) => {
            return new Map([
                [0, class extends c {
                    getTemplateName() {
                        return 'main';
                    }
                }],
                [1, class extends c {
                    getTemplateName() {
                        return 'embedded';
                    }
                }]
            ])
        }, 'foo');

        let actualTemplate = env.loadTemplate('foo');
        let actualEmbeddedTemplate = env.loadTemplate('foo', 1);

        test.true(loaderSpy.notCalled, 'Loader should not be queried');
        test.true(cacheSpy.notCalled, 'Cache should not be queried');
        test.equal(actualTemplate.getTemplateName(), 'main', 'Main template should be loaded successfully');
        test.equal(actualEmbeddedTemplate.getTemplateName(), 'embedded', 'Embedded template should be loaded successfully');

        test.end();
    });

    test.test('getSourceMapNodeFactories', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({}));

        let factories = env.getSourceMapNodeFactories();

        test.true(factories.has(TwingNodeType.SPACELESS));

        test.end();
    });

    test.test('checkMethodAllowed', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({}));

        let obj = {};

        try {
            env.checkMethodAllowed(obj, 'foo');

            test.pass();
        }
        catch (e) {
            test.fail();
        }

        env = new TwingEnvironment(new TwingLoaderArray({}), {
            sandboxed: true
        });

        try {
            env.checkMethodAllowed(obj, 'foo');

            test.fail();
        }
        catch (e) {
            test.same(e.message, 'Calling "foo" method on a "Object" is not allowed.');
        }

        test.end();
    });

    test.test('checkPropertyAllowed', function (test) {
        let env = new TwingEnvironment(new TwingLoaderArray({}));

        let obj = {};

        try {
            env.checkPropertyAllowed(obj, 'foo');

            test.pass();
        }
        catch (e) {
            test.fail();
        }

        env = new TwingEnvironment(new TwingLoaderArray({}), {
            sandboxed: true
        });

        try {
            env.checkPropertyAllowed(obj, 'foo');

            test.fail();
        }
        catch (e) {
            test.same(e.message, 'Calling "foo" property on a "Object" is not allowed.');
        }

        test.end();
    });

    test.end();
});
