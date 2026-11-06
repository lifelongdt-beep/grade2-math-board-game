import { auditGrade3 } from '../levels/auditRepairs';
import { registerGenerator } from '../questionRegistry';
import { generateGrade31Questions } from '../grade31';
import { 수준3 } from '../levels/s3';
import { 수준31문제집 } from '../levels/s31book';
import { 수준32문제집 } from '../levels/s32book';
import { registerLevels } from '../levels/registry';
registerLevels(수준3, 수준31문제집, 수준32문제집, auditGrade3);
registerGenerator(3, (l, d, o) => generateGrade31Questions(l, d, o?.판) ?? []);
