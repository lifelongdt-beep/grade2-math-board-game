import { registerGenerator } from '../questionRegistry';
import { generateGrade31Questions } from '../grade31';
import { 수준3 } from '../levels/s3';
import { registerLevels } from '../levels/registry';
registerLevels(수준3);
registerGenerator(3, (l, d, o) => generateGrade31Questions(l, d, o?.판) ?? []);
