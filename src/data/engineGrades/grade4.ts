import { registerGenerator } from '../questionRegistry';
import { generateGrade41Questions } from '../grade41';
import { generateGrade42Questions } from '../grade42';
import { 수준41 } from '../levels/s41';
import { 수준41문제집 } from '../levels/s41book';
import { 수준42 } from '../levels/s42';
import { registerLevels } from '../levels/registry';
registerLevels(수준41, 수준41문제집, 수준42);
registerGenerator(4, (l, d, o) => generateGrade41Questions(l, d, o?.판) ?? generateGrade42Questions(l, d, o?.판) ?? []);
