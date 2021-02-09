import { Session } from "neo4j-driver";
import { READ, WRITE } from "neo4j-driver/types/driver";
import { useContext } from "react";
import { Neo4jContext } from "./neo4j.context";

export const useSession = (defaultAccessMode: any, db?: string): Session => {
    const { driver, database } = useContext(Neo4jContext)

    if ( !driver ) throw new Error('`driver` not defined in Neo4jContext. Have you added it into your app as <Neo4jProvider driver={{driver}}> ?')

    let useDatabases = db || database

    if ( useDatabases !== undefined && useDatabases !== '' ) {
        return driver!.session({ database: useDatabases, defaultAccessMode })
    }

    return driver!.session({ defaultAccessMode })
}

export const useReadSession = (db?: string): Session => useSession(READ, db)
export const useWriteSession = (db?: string): Session => useSession(WRITE, db)