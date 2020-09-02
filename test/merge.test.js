const { mergeOption } = require('../lib/core');
const assert = require('assert');

describe('switchy-merge test case', function() {
    describe('case 1', function () {
        const mockOpt1 = {
            rules: JSON.stringify({
                // same rule
                id1: {
                    id: 'id1',
                    name: 'name-a',
                    profileId: 'profileId-a',
                    urlPattern: 'urlPattern-a',
                    patternType: 'patternType-a'
                },
                // actually same rule
                id2: {
                    id: 'id2',
                    name: 'name-b',
                    profileId: 'profileId-b',
                    urlPattern: 'urlPattern-b',
                    patternType: 'patternType-b'
                },
                // ids conflict
                id4: {
                    id: 'id4',
                    name: 'name-c',
                    profileId: 'profileId-c',
                    urlPattern: 'urlPattern-c',
                    patternType: 'patternType-c'
                }
            })
        };
        const mockOpt2 = {
            rules: JSON.stringify({
                // same rule
                id1: {
                    id: 'id1',
                    name: 'name-a',
                    profileId: 'profileId-a',
                    urlPattern: 'urlPattern-a',
                    patternType: 'patternType-a'
                },
                // actually same rule
                id3: {
                    id: 'id3',
                    name: 'name-b',
                    profileId: 'profileId-b',
                    urlPattern: 'urlPattern-b',
                    patternType: 'patternType-b'
                },
                // ids conflict
                id4: {
                    id: 'id4',
                    name: 'name-d',
                    profileId: 'profileId-d',
                    urlPattern: 'urlPattern-d',
                    patternType: 'patternType-d'
                }
            })
        };
        const mergeOpt = mergeOption(mockOpt1, mockOpt2);
        const rules = JSON.parse(mergeOpt.rules);

        it('keys count', function () {
            assert.strictEqual(Object.keys(rules).length, 4);
        });
        it('id1 check', function () {
            assert.strictEqual(rules.id1.name, 'name-a');
        });
        it('id2 check', function () {
            assert.strictEqual(typeof rules.id2, 'undefined');
        });
        it('id3 check', function () {
            assert.strictEqual(rules.id3.name, 'name-b');
        });
        it('id4 check', function () {
            assert.strictEqual(rules.id4.name, 'name-d');
            assert.strictEqual(rules.id4_rn.name, 'name-c');
        });

    });
});