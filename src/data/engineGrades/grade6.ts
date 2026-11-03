import { registerGenerator } from '../questionRegistry';
import { generateGrade61Questions } from '../grade61';
import { generateGrade62Questions } from '../grade62';
import { 수준61 } from '../levels/s61';
import { 수준62 } from '../levels/s62';
import { registerLevels } from '../levels/registry';
registerLevels(수준61, 수준62);
registerGenerator(6, (l, d, o) => generateGrade61Questions(l, d, o?.판) ?? generateGrade62Questions(l, d, o?.판) ?? []);
