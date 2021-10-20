import { useContext, useEffect, useState } from 'react'
import neo4j, { Record as Neo4jRecord, QueryResult, Result, Session, Driver } from "neo4j-driver"
import { Neo4jContext } from './neo4j.context'

interface Neo4jQueryState {
    loading: boolean;
    session?: Session;
    error?: Error;
    result?: QueryResult;
    records?: Neo4jRecord[];
    first?: Neo4jRecord;
}

export interface LazyResultState extends Neo4jQueryState {
    cypher?: string;
    params?: Record<string, any>;
    database?: string;
}

export interface EagerResultState extends LazyResultState {
    run: (params?: Record<string, any>, anotherDatabase?: string) => Promise<void | QueryResult>;
}

export const useCypher = (defaultAccessMode: any, cypher: string, params?: Record<string, any>, database?: string) : EagerResultState => {
    const [ run, queryState ] = useLazyCypher(defaultAccessMode, cypher, database)

    useEffect(() => {
        run(params, database)
    }, [])

    return {
        run,
        ...queryState
    }
}

const createSession = (driver: Driver, database: string | undefined, defaultAccessMode: any): Session => {
    if ( database !== undefined && database !== '' ) {
        return driver!.session({ database, defaultAccessMode })
    }

    return driver!.session({ defaultAccessMode })
}

export const useReadCypher = (cypher: string, params?: Record<string, any>, database?: string): EagerResultState => useCypher(neo4j.session.READ, cypher, params, database)
export const useWriteCypher = (cypher: string, params?: Record<string, any>, database?: string): EagerResultState => useCypher(neo4j.session.WRITE, cypher, params, database)

export const useLazyReadCypher = (cypher: string, database?: string): [ (params?: Record<string, any>) => Promise<void | QueryResult>, LazyResultState ] => useLazyCypher(neo4j.session.READ, cypher, database)
export const useLazyWriteCypher = (cypher: string, database?: string): [ (params?: Record<string, any>) => Promise<void | QueryResult>, LazyResultState ] => useLazyCypher(neo4j.session.WRITE, cypher, database)

const useLazyCypher = (defaultAccessMode: any, cypher: string, defaultDatabase?: string): [ (params?: Record<string, any>, anotherDatabase?: string) => Promise<void | QueryResult>, LazyResultState ] => {
    const { driver, database } = useContext(Neo4jContext)
    if ( !driver ) throw new Error('`driver` not defined in Neo4jContext. Have you added it into your app as <Neo4jProvider driver={{driver}}> ?')

    const [ queryState, setQueryState ] = useState<LazyResultState>({ loading: false, database, cypher })

    const run = (params?: Record<string, any>, anotherDatabase?: string): Promise<void | QueryResult> => {
        const session = createSession(driver, anotherDatabase || defaultDatabase || database, defaultAccessMode)

        setQueryState({ session, loading: true, database: anotherDatabase || defaultDatabase || database, cypher })

        return session.run(cypher, params)
            .then((result: QueryResult) => {
                setQueryState({
                    session,
                    cypher,
                    params,
                    database: anotherDatabase || defaultDatabase || database,
                    loading: false,
                    result,
                    records: result.records,
                    first: result.records[0],
                })

                session.close()

                return result
            })
            .catch((error: Error) => {
                setQueryState({
                    session,
                    cypher,
                    params,
                    database: anotherDatabase || defaultDatabase || database,
                    loading: false,
                    error,
                })

                session.close()
            })
    }

    return [
        run,
        {
            cypher,
            database,
            ...queryState
        }
    ]
}
