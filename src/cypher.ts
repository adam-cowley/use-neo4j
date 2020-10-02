import { useContext, useEffect, useState } from 'react'
import neo4j, { Record as Neo4jRecord, QueryResult } from "neo4j-driver"
import { Neo4jContext } from './neo4j.context'

export interface Neo4jResultState {
    cypher: string;
    params?: Record<string, any>;
    database?: string;
    loading: boolean;
    error?: Error;
    result?: QueryResult;
    records?: Neo4jRecord[],
    first?: Neo4jRecord,
}

export const useCypher = (defaultAccessMode: any, cypher: string, params?: Record<string, any>, database?: string) : Neo4jResultState => {
    const { driver } = useContext(Neo4jContext)

    if ( !driver ) throw new Error('`driver` not defined. Have you added it into your app as <Neo4jContext.Provider value={{driver}}> ?')

    const session = driver.session({ database, defaultAccessMode })

    const [ queryState, setQueryState ] = useState<Neo4jResultState>({
        loading: true,
        cypher,
        params,
        database,
    })

    useEffect(() => {
        session.run(cypher, params)
            .then((result: QueryResult) => {
                setQueryState({
                    cypher,
                    params,
                    database,
                    loading: false,
                    result,
                    records: result.records,
                    first: result.records[0],
                })
            })
            .catch((error: Error) => {
                setQueryState({
                    cypher,
                    params,
                    database,
                    loading: false,
                    error,
                })
            })
        // eslint-disable-next-line
    }, [ cypher, params, database ])


    return queryState
}

export const useReadCypher = (cypher: string, params?: Record<string, any>, database?: string): Neo4jResultState => useCypher(neo4j.session.READ, cypher, params, database)

export const useWriteCypher = (cypher: string, params?: Record<string, any>, database?: string): Neo4jResultState => useCypher(neo4j.session.WRITE, cypher, params, database)
