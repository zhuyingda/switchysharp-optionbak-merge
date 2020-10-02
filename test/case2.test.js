/**
 * Copyright (c) 2020 5u9ar
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const { mergeProxyRule } = require('../lib/core');
const assert = require('assert');
describe('switchy-merge test case 2', () => {
  const mockRule1 = {
      // same rule
      id1: {
          id: 'id1',
          name: 'name-a',
          profileId: 'profileId-a',
          urlPattern: 'urlPattern-a',
          patternType: 'patternType-a'
      }
  };
  const mockRule2 = {
      // same rule
      id1: {
          id: 'id1',
          name: 'name-a',
          profileId: 'profileId-a',
          urlPattern: 'urlPattern-a',
          patternType: 'patternType-a'
      }
  };
  const mockRule3 = {
      // actually same rule
      id1: {
          id: 'id1',
          name: 'name-a',
          profileId: 'profileId-bbbb',
          urlPattern: 'urlPattern-a',
          patternType: 'patternType-a'
      }
  };
  const mockRule4 = {
      // diff rule
      id1: {
          id: 'id1',
          name: 'name-c',
          profileId: 'profileId-cccccc',
          urlPattern: 'urlPattern-cccccc',
          patternType: 'patternType-a'
      }
  };
  const mockRule5 = {
      // another diff rule
      id1: {
          id: 'id1',
          name: 'name-c',
          profileId: 'profileId-cccccc',
          urlPattern: 'urlPattern-ddddddddddd',
          patternType: 'patternType-a'
      }
  };
  const mergeRules = mergeProxyRule(mockRule1, mockRule2, mockRule3, mockRule4, mockRule5);

  console.log(mergeRules);

  it('keys count', () => {
      assert.strictEqual(Object.keys(mergeRules).length, 3);
  });

  it('id1 check', () => {
      assert.strictEqual(mergeRules.id1.name, 'name-c');
      assert.strictEqual(mergeRules.id1.profileId, 'profileId-cccccc');
      assert.strictEqual(mergeRules.id1.urlPattern, 'urlPattern-ddddddddddd');
  });

  it('id1_rn check', () => {
      assert.strictEqual(mergeRules.id1_rn.name, 'name-a');
      assert.strictEqual(mergeRules.id1_rn.profileId, 'profileId-bbbb');
      assert.strictEqual(mergeRules.id1_rn.urlPattern, 'urlPattern-a');
  });

  it('id1_rn_rn check', () => {
      assert.strictEqual(mergeRules.id1_rn_rn.name, 'name-c');
      assert.strictEqual(mergeRules.id1_rn_rn.profileId, 'profileId-cccccc');
      assert.strictEqual(mergeRules.id1_rn_rn.urlPattern, 'urlPattern-cccccc');
  });
});