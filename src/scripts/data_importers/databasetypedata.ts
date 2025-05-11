import { DatabaseType } from "../../models/research/databaseType";

export async function importDatabaseTypeData() {
  let count = 0;
  const type = ["Scopus", "TCI"];
  for (const t of type) {
    count++;
    const typeMo = new DatabaseType();
    typeMo.databaseId = count;
    typeMo.typeName = t;
    await typeMo.save();
  }
}
