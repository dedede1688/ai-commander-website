/* 预览资料由正式的单一数据源派生。 */
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const {preparedOn,members,groups}=require('../member-data.js');
const data={preparedOn,members,groups:groups.map(g=>({name:g.name,count:g.members.length}))};
fs.mkdirSync(path.join(root,'previews'),{recursive:true});
fs.writeFileSync(path.join(root,'previews/member-data.json'),JSON.stringify(data,null,2)+'\n');
console.log(`Prepared ${members.length} existing members across ${groups.length} groups.`);
