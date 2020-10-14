import { renderHook, act } from '@testing-library/react-hooks'
import { useReadCypher, useWriteCypher, useLazyReadCypher } from './cypher'
import { createDriver } from './driver'
import { Neo4jProvider } from './neo4j.provider'
import { mockResult } from './test/utils'
import { int } from 'neo4j-driver'

const mockRun = jest.fn((query) => new Promise((resolve, reject) => {
    const result = mockResult([ { count: int(1) }])

    setTimeout(() => resolve(result), 20)
}))

jest.mock('neo4j-driver/lib/session', () => jest.fn().mockImplementation(
    () => ({
        run: mockRun,
        close: jest.fn(() => Promise.resolve())
    })
))


describe('Cypher Hooks', () => {
    const driver = createDriver('neo4j', 'localhost', 7687, 'neo4j', 'neo')

    beforeEach(() => {
        mockRun.mockClear()
    })

    afterAll(() => driver.close())

    describe('useReadCypher', () => {
        it('should run a simple query', async () => {
            const cypher = 'MATCH (n) RETURN count(n) AS count'
            const params = undefined
            const database = undefined

            const wrapper = ({ children }) => Neo4jProvider({ children, driver })
            const { result, waitForNextUpdate } = renderHook(() => useReadCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(database)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should run a query with parameters', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = undefined

            const wrapper = ({ children }) => Neo4jProvider({ children, driver })
            const { result, waitForNextUpdate } = renderHook(() => useReadCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should run a query with parameters on a specific database', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = 'mydb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver })
            const { result, waitForNextUpdate } = renderHook(() => useReadCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(database)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should use the specified database', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = 'mydb'
            const contextDb = 'contextDb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver, database: contextDb })
            const { result, waitForNextUpdate } = renderHook(() => useReadCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(database)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should fallback to the database used in the context', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = undefined
            const contextDb = 'contextDb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver, database: contextDb })
            const { result, waitForNextUpdate } = renderHook(() => useReadCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(contextDb)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })
    })

    describe('useWriteCypher', () => {
        it('should run a simple query', async () => {
            const cypher = 'MATCH (n) RETURN count(n) AS count'
            const params = undefined
            const database = undefined

            const wrapper = ({ children }) => Neo4jProvider({ children, driver })
            const { result, waitForNextUpdate } = renderHook(() => useWriteCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(database)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should run a query with parameters', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = undefined

            const wrapper = ({ children }) => Neo4jProvider({ children, driver })
            const { result, waitForNextUpdate } = renderHook(() => useWriteCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should run a query with parameters on a specific database', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = 'mydb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver })
            const { result, waitForNextUpdate } = renderHook(() => useWriteCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(database)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should use the specified database', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = 'mydb'
            const contextDb = 'contextDb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver, database: contextDb })
            const { result, waitForNextUpdate } = renderHook(() => useWriteCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(database)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })

        it('should fallback to the database used in the context', async () => {
            const cypher = 'MATCH (n) WHERE n.key = $value RETURN count(n) AS count'
            const params = { value: true }
            const database = undefined
            const contextDb = 'contextDb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver, database: contextDb })
            const { result, waitForNextUpdate } = renderHook(() => useWriteCypher(cypher, params, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Run Query
            await act(async () => {
                // Loading State
                expect(result.current.loading).toBe(true)
                expect(result.current.database).toEqual(contextDb)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)

                // Await Result
                await waitForNextUpdate()

                const { loading, records, first } = result.current

                expect(loading).toBe(false)
                expect(records).toBeInstanceOf(Array)
                expect(records!.length).toEqual(1)
                expect(first).toBeDefined()
            })
        })
    })

    describe('useLazyReadCypher', () => {
        it('should run a simple query', async () => {
            const cypher = 'MATCH (n) RETURN count(n) AS count'
            const params = undefined
            const database = undefined

            const wrapper = ({ children }) => Neo4jProvider({ children, driver })
            const { result, waitForNextUpdate } = renderHook(() => useLazyReadCypher(cypher, database), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            // Initial State
            await act(async () => {
                const [ run, state ] = result.current

                // Loading State
                expect(state.loading).toBe(false)
                expect(state.database).toEqual(database)
            })

            // Run Query
            await act(async () => {
                // Trigger Load
                result.current[0]()

                // Await Result
                await waitForNextUpdate()

                expect(result.current[1].loading).toBe(true)
                expect(result.current[1].database).toEqual(database)

                // Results returned
                await waitForNextUpdate()

                expect(result.current[1].loading).toBe(false)

                // @ts-ignore
                const [ query, calledParams ] = mockRun.mock.calls[0]

                expect(query).toEqual(cypher)
                expect(params).toEqual(calledParams)
            })
        })

        it('should run a query on the specified db', async () => {
            const cypher = 'MATCH (n) RETURN count(n) AS count'
            const params = {a: 1}
            const database = 'mydb'
            const originalDb = 'original'
            const contextDb = 'contextdb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver, database: contextDb })
            const { result, waitForNextUpdate } = renderHook(() => useLazyReadCypher(cypher, originalDb), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            await act(async () => {
                // Trigger Load
                // @ts-ignore
                await result.current[0](params, database)

                expect(result.current[1].loading).toBe(false)
                expect(result.current[1].database).toEqual(database)
            })
        })

        it('should use original db if no specific one is set', async () => {
            const cypher = 'MATCH (n) RETURN count(n) AS count'
            const params = {a: 1}
            const database = 'mydb'
            const originalDb = 'original'
            const contextDb = 'contextdb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver, database: contextDb })
            const { result, waitForNextUpdate } = renderHook(() => useLazyReadCypher(cypher, originalDb), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            await act(async () => {
                // Trigger Load
                // @ts-ignore
                await result.current[0](params, database)

                expect(result.current[1].loading).toBe(false)
                expect(result.current[1].database).toEqual(database)
            })
        })

        it('should fall back to context db if no original/specific', async () => {
            const cypher = 'MATCH (n) RETURN count(n) AS count'
            const params = {a: 1}
            const database = 'mydb'
            const originalDb = 'original'
            const contextDb = 'contextdb'

            const wrapper = ({ children }) => Neo4jProvider({ children, driver, database: contextDb })
            const { result, waitForNextUpdate } = renderHook(() => useLazyReadCypher(cypher, originalDb), { wrapper })

            // Set Driver
            await waitForNextUpdate()

            await act(async () => {
                // Trigger Load
                // @ts-ignore
                await result.current[0](params)

                expect(result.current[1].loading).toBe(false)
                expect(result.current[1].database).toEqual(originalDb)
            })
        })
    })

})