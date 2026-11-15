import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest as copilot } from '../functions/api/compliance-assistant.js';
import { onRequest as brief } from '../functions/api/employee-summary.js';
import { evaluateEmployee } from '../src/data/evaluateEmployee.js';
import { reportingEmployee } from '../src/data/reporting.js';

test('both AI endpoints receive current structured data and policy instructions', async () => {
  const employee = reportingEmployee(evaluateEmployee({name:'Example',homeCountry:'United States',hostRegion:'Schengen Area',daysUsed:74},[],599,55));
  const originalFetch = globalThis.fetch;
  try {
    for (const handler of [copilot,brief]) {
      let captured;
      globalThis.fetch = async (url,options) => {
        captured = JSON.parse(options.body);
        return new Response(JSON.stringify({content:[{type:'text',text:'Mock answer'}]}),{status:200});
      };
      const request = new Request('https://example.test/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({employee,roster:[employee],query:'What risks?'})});
      const response = await handler({request,env:{ANTHROPIC_API_KEY:'mock'}});
      assert.equal((await response.json()).success,true);
      assert.match(captured.system,/Tax residency is not a violation/);
      assert.match(captured.system,/Null means unknown/);
      const payload=JSON.parse(captured.messages.at(-1).content);
      // JSON transport omits undefined optional fields; compare the wire representation.
      assert.deepEqual(payload.employee ?? payload.roster[0],JSON.parse(JSON.stringify(employee)));
    }
  } finally { globalThis.fetch = originalFetch; }
});
