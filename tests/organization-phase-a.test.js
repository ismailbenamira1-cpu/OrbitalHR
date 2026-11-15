import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const migration=readFileSync(new URL('../docs/GATE5_PHASE_A_ORGANIZATION_SCHEMA.sql',import.meta.url),'utf8');
const guide=readFileSync(new URL('../docs/GATE5_ORGANIZATION_CLOSURE_ARCHITECTURE.md',import.meta.url),'utf8');
const normalize=s=>s.replace(/--[^\n]*/g,'').replace(/\s+/g,' ').trim().toLowerCase();

test('Phase A is additive, starts all new tables with RLS and denies browser table access',()=>{
  const sql=normalize(migration);
  for(const table of ['organizations','organization_memberships','orbital_internal.organization_closure_requests']){
    const qualified=table.includes('.')?table:'public.'+table;
    assert.match(sql,new RegExp('create table if not exists '+qualified.replace('.','\\.')));
    assert.match(sql,new RegExp('alter table '+qualified.replace('.','\\.')+' enable row level security'));
    assert.ok(sql.includes('revoke all on table '+qualified+' from public, anon, authenticated'));
  }
  assert.ok(sql.includes('revoke all on schema orbital_internal from public, anon, authenticated'));
  assert.ok(!/create\s+policy\s+/i.test(sql),'No customer-facing policies until tenant isolation is implemented');
});

test('Existing roster columns, user grants and ownership policies stay unchanged',()=>{
  const sql=normalize(migration);
  assert.ok(sql.includes('add column if not exists organization_id uuid'));
  assert.ok(sql.includes('references public.organizations(id) on delete restrict'));
  assert.doesNotMatch(sql,/drop\s+(table|column|policy)|truncate\s+|delete\s+from\s+|update\s+public\.employee_rosters|alter\s+table\s+public\.employee_rosters\s+disable\s+row\s+level\s+security/i);
  assert.doesNotMatch(sql,/revoke\s+(all|select|insert|update|delete)\s+on\s+(table\s+)?public\.employee_rosters/i);
  assert.match(sql,/add column if not exists organization_id uuid references public\\.organizations/);
  assert.match(sql,/before insert or update on public\.employee_rosters/);
  assert.match(sql,/current_user in \('anon','authenticated'\)/);
});

test('Tenant membership roles are constrained and cannot be inserted by browser roles in Phase A',()=>{
  const sql=normalize(migration);
  assert.ok(sql.includes("role in ('owner','admin','member')"));
  assert.ok(sql.includes('primary key (organization_id,user_id)'));
  assert.ok(sql.includes("membership_state in ('active','revoked')"));
  assert.ok(!/grant (insert|update|delete|select|all) on table public\.organization_memberships to (anon|authenticated)/.test(sql));
});

test('Closure deadline is bounded by 30 days and no job or auth-user deletion is staged',()=>{
  const sql=normalize(migration);
  assert.ok((sql.match(/interval '30 days'/g)||[]).length>=2);
  assert.ok(sql.includes('delete_by >= effective_at'));
  assert.doesNotMatch(sql,/cron\.schedule|pg_cron|delete\s+from\s+auth\.users|delete\s+from\s+public\.employee_rosters/i);
  assert.match(guide,/multiple companies per user|multiple companies/i);
});

test('Migration is wrapped in transaction and never auto-backfills organizations',()=>{
  const sql=normalize(migration);
  assert.ok(sql.startsWith('begin;'));
  assert.ok(sql.endsWith('commit;'));
  assert.doesNotMatch(sql,/insert\s+into\s+public\.organizations|insert\s+into\s+public\.organization_memberships/i);
});
