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
const fs = require('fs');
const chalk = require('chalk');
const jq = require('./jq-base64-migrate');

function mergeOption(...options) {
  let ruleLists = [];
  for (let option of options) {
    ruleLists.push(JSON.parse(option.rules));
  }

  let mergeRule = mergeProxyRule(...ruleLists);

  let outputOption = copyObj(options[options.length - 1]);
  outputOption.rules = JSON.stringify(mergeRule);
  return outputOption;
};

function mergeProxyRule(...ruleLists) {
  let mergeRule = {};

  for (let ruleList of ruleLists) {
    forEachObject(ruleList, rule => {
      isValidRule(rule);
    });

    mergeRuleList(ruleList);
  }

  return mergeRule;

  function mergeRuleList(ruleList) {
    if (Object.keys(mergeRule).length === 0) {
      mergeRule = copyObj(ruleList);
      return;
    }
  
    forEachObject(ruleList, (curRule, curKey) => {
      let hasFound = false;
      forEachObject(mergeRule, (curRuleInM, curKeyInM) => {
        if (isRuleEqual(curRule, curRuleInM)) {
          hasFound = true;
          return 'break';
        }
    
        if (isRuleActuallySame(curRule, curRuleInM)) {
          if (/^Quick Rule/.test(curRule.id)) {
            hasFound = true;
            console.log(chalk.yellow('ignore quick rule'), curRule);
            return 'break';
          }
          else if (/^Quick Rule/.test(curRuleInM.id)) {
            delete mergeRule[curKeyInM];
            mergeRule[curKey] = copyObj(curRule);
            hasFound = true;
            console.log(chalk.yellow('override quick rule'), curRule);
          }
          else {
            delete mergeRule[curKeyInM];
            mergeRule[curKey] = copyObj(curRule);
            hasFound = true;
            console.log(chalk.yellow('override quick rule'), curRule);
          }
        }
  
        if (isRuleIdConflict(curRule, curRuleInM)) {
          // rename the id by suffix
          let newId = curRuleInM.id + '_rn';
          while (mergeRule.hasOwnProperty(newId)) {
            newId += '_rn';
          }
          curRuleInM.id = newId;
          mergeRule[newId] = copyObj(curRuleInM);
          console.log(chalk.red('conflict rule, copy orig'), mergeRule[newId]);
          mergeRule[curKey] = copyObj(curRule);
          console.log(chalk.red('conflict rule, new one'), curRule);
          hasFound = true;
        }
  
      });
    
      if (!hasFound) {
        mergeRule[curKey] = copyObj(curRule);
        console.log(chalk.blue('add new rule'), curRule);
      }
    
    });
  }
}

exports.mergeProxyRule = mergeProxyRule;

exports.mergeOption = mergeOption;

exports.mergeBakFile = function (...bakFilePaths) {
  // let option1 = fs.readFileSync(bakFilePath1).toString();
  // option1 = JSON.parse(jq.base64Decode(option1));
  // let option2 = fs.readFileSync(bakFilePath2).toString();
  // option2 = JSON.parse(jq.base64Decode(option2));
  const options = [];
  for (let bakFilePath of bakFilePaths) {
    let option = fs.readFileSync(bakFilePath).toString();
    option = JSON.parse(jq.base64Decode(option));
    options.push(option);
  }
  return mergeOption(...options);
};

exports.outputFile = function (outputOption, filePath) {
  let output = jq.base64Encode(JSON.stringify(outputOption));
  fs.writeFileSync(filePath, output, 'utf8');
};

function copyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isRuleEqual(rule1, rule2) {
  if (
    rule1.name === rule2.name
    && rule1.urlPattern === rule2.urlPattern
    && rule1.patternType === rule2.patternType
    && rule1.profileId === rule2.profileId
    && rule1.id === rule2.id
  ) {
    return true;
  }
  else {
    return false;
  }
}

function isRuleActuallySame(rule1, rule2) {
  if (
    rule1.name === rule2.name
    && rule1.urlPattern === rule2.urlPattern
    && rule1.patternType === rule2.patternType
  ) {
    return true;
  }
  else {
    return false;
  }
}

function isRuleIdConflict(rule1, rule2) {
  if (
    (rule1.name !== rule2.name
    || rule1.urlPattern !== rule2.urlPattern)
    && rule1.id === rule2.id
  ) {
    return true;
  }
  else {
    return false;
  }
}

function isValidRule(obj) {
  if (
    !isNormalStr(obj.id) ||
    !isNormalStr(obj.name) ||
    !isNormalStr(obj.patternType) ||
    !isNormalStr(obj.profileId) ||
    !isNormalStr(obj.urlPattern)
  ) {
    throw new Error('unsupport rule shape:', obj);
  }
  if (Object.keys(obj).length !== 5) {
    throw new Error('dunsupport rule shape:', obj);
  }
  return true;
}

function isNormalStr(str) {
  return typeof str === 'string' && str.length > 0
}

function forEachObject(obj, cb) {
  for (let key of Object.keys(obj)) {
    let retCmd = cb(obj[key], key);
    if (retCmd === 'break') {
      break;
    }
  }
}
