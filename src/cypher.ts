import { useContext, useEffect, useState } from 'react'
import neo4j, { Record as Neo4jRecord, QueryResult, Result } from "neo4j-driver"
import { Neo4jContext } from './neo4j.context'

interface Neo4jQueryState {
    loading: boolean;
    error?: Error;
    result?: QueryResult;
    records?: Neo4jRecord[],
    first?: Neo4jRecord,
}

export interface Neo4jResultState extends Neo4jQueryState {
    cypher: string;
    params?: Record<string, any>;
    database?: string;
}

const runCypher = (defaultAccessMode: any, cypher: string, params?: Record<string, any>, database?: string): Promise<QueryResult> => {
    const { driver } = useContext(Neo4jContext)

    if ( !driver ) throw new Error('`driver` not defined in Neo4jContext. Have you added it into your app as <Neo4jProvider driver={{driver}}> ?')

    const session = driver!.session({ database, defaultAccessMode })

    return session.run(cypher, params)
        .then(res => {
            session.close()

            return res
        })
}

export const read = (cypher: string, params?: Record<string, any>, database?: string) => runCypher(neo4j.session.READ, cypher, params, database)

export const write = (cypher: string, params?: Record<string, any>, database?: string) => runCypher(neo4j.session.WRITE, cypher, params, database)

export const useCypher = (defaultAccessMode: any, cypher: string, params?: Record<string, any>, database?: string) : Neo4jResultState => {
    const { driver } = useContext(Neo4jContext)

    if ( !driver ) throw new Error('`driver` not defined. Have you added it into your app as <Neo4jContext.Provider value={{driver}}> ?')

    const session = driver.session({ database, defaultAccessMode })

    const [ queryState, setQueryState ] = useState<Neo4jQueryState>({
        loading: true,
    })

    useEffect(() => {
        session.run(cypher, params)
            .then((result: QueryResult) => {
                setQueryState({
                    loading: false,
                    result,
                    records: result.records,
                    first: result.records[0],
                })
            })
            .catch((error: Error) => {
                setQueryState({
                    loading: false,
                    error,
                })
            })
    }, [])


    return {
        cypher,
        params,
        database,
        ...queryState
    }
}

export const useReadCypher = (cypher: string, params?: Record<string, any>, database?: string): Neo4jResultState => useCypher(neo4j.session.READ, cypher, params, database)

export const useWriteCypher = (cypher: string, params?: Record<string, any>, database?: string): Neo4jResultState => useCypher(neo4j.session.WRITE, cypher, params, database)
