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

let mergeRule = {};

function mergeOption(option1, option2) {
  let ruleList1 = JSON.parse(option1.rules);
  let ruleList2 = JSON.parse(option2.rules);

  forEachObject(ruleList1, rule => {
    isValidRule(rule);
  });
  forEachObject(ruleList2, rule => {
    isValidRule(rule);
  });

  mergeRuleList(ruleList1);
  mergeRuleList(ruleList2);

  let outputOption = copyObj(option2);
  outputOption.rules = JSON.stringify(mergeRule);
  return outputOption;
};

exports.mergeOption = mergeOption;

exports.mergeBakFile = function (bakFilePath1, bakFilePath2) {
  let option1 = fs.readFileSync(bakFilePath1).toString();
  option1 = JSON.parse(jq.base64Decode(option1));
  let option2 = fs.readFileSync(bakFilePath2).toString();
  option2 = JSON.parse(jq.base64Decode(option2));

  return mergeOption(option1, option2);
};

exports.outputFile = function (outputOption, filePath) {
  let output = jq.base64Encode(JSON.stringify(outputOption));
  fs.writeFileSync(filePath, output, 'utf8');
};

function mergeRuleList(ruleList) {
  if (Object.keys(mergeRule).length === 0) {
    mergeRule = copyObj(ruleList);
    return;
  }

  forEachObject(ruleList, (curRule, curKey) => {
    forEachObject(mergeRule, (curRuleInM, curKeyInM) => {
      if (isRuleEqual(curRule, curRuleInM)) {
        hasFound = true;
        return 'break';
      }
  
      if (isRuleSimilar(curRule, curRuleInM)) {
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
        mergeRule[curKeyInM + '_rn'] = copyObj(curRuleInM);
      }

    });
  
    if (!hasFound) {
      mergeRule[curKey] = copyObj(curRule);
      console.log(chalk.blue('add new rule'), curRule);
    }
  
  });
}

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
    && rule1.id !== rule2.id
  ) {
    return true;
  }
  else if (
    rule1.name === rule2.name
    && rule1.urlPattern === rule2.urlPattern
    && rule1.patternType === rule2.patternType
    && rule1.profileId !== rule2.profileId
    && rule1.id !== rule2.id
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
