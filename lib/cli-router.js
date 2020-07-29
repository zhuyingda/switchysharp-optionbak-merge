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
const path = require('path');
const { Command } = require('commander');
const { version } = require('../package.json');
const { mergeBakFile, outputFile } = require('./core');
const program = new Command();
program.version(version);

program
  .requiredOption('-i, --input [letters...]', 'input *.bak file from SwitchySharp export')
  .requiredOption('-o, --output [type]', 'output *.bak file from SwitchySharp export')

exports.run = function () {
  program.parse(process.argv);

  for (let inputFilePath of program.input) {
    if (!fs.existsSync(path.resolve(inputFilePath))) {
      throw new Error(`input file not exist: ${inputFilePath}`);
    }
  }

  console.log('try to merge option backup files include:');
  for (let inputFilePath of program.input) {
    console.log(path.resolve(inputFilePath));
  }
  let rel = mergeBakFile(path.resolve(program.input[0]), path.resolve(program.input[1]));

  console.log(`output to here: ${path.resolve(program.output)}`);
  outputFile(rel, program.output);
}
