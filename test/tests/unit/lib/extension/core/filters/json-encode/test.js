const {jsonEncode} = require('../../../../../../../../dist/cjs/lib/extension/core/filters/json-encode');

const tap = require('tape');

tap.test('json-encode', function (test) {
    test.test('supports Map instances', function (test) {
        test.same(jsonEncode(new Map([['a', 1], ['b', '2']])), '{"a":1,"b":"2"}');
        test.same(jsonEncode(new Map([[0, 1], [1, '2']])), '[1,"2"]');
        test.same(jsonEncode(new Map([['0', 1], [1, '2']])), '[1,"2"]');

        test.end();
    });

    test.test('supports Array instances', function (test) {
        test.same(jsonEncode([1, '2']), '[1,"2"]');

        test.end();
    });

    test.test('supports Object instances', function (test) {
        test.same(jsonEncode({a: 1, b: "2"}), '{"a":1,"b":"2"}');
        test.same(jsonEncode({0: 1, 1: "2"}), '{"0":1,"1":"2"}');
        test.same(jsonEncode({"0": 1, 1: "2"}), '{"0":1,"1":"2"}');

        test.end();
    });

    test.test('supports strings', function (test) {
        test.same(jsonEncode('foo'), '"foo"');
        test.same(jsonEncode(String('foo')), '"foo"');

        test.end();
    });

    test.end();
});