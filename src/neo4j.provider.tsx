import React, { useEffect, useState } from 'react'
import { auth, Driver, AuthToken } from 'neo4j-driver'
import { Login } from './components/login'
import neo4j from 'neo4j-driver'

import { Neo4jContext } from './neo4j.context'
import { createDriver } from './driver'
import { LOCAL_STORAGE_KEY, Neo4jConfig, Neo4jScheme } from './neo4j-config.interface'

interface Neo4jProviderProps {
    children: React.ReactNode | React.ReactNode[] | null;
    driver?: Driver;
    scheme?: Neo4jScheme;
    host?: string;
    port?: string | number;
    username?: string;
    password?: string;
    database?: string;

    showHost?: boolean;
    showDatabase?: boolean;
    showActive?: boolean;

    title?: React.ReactNode | React.ReactNode[] | null;
    logo?: React.ReactNode | React.ReactNode[] | null;
    details?: React.ReactNode | React.ReactNode[] | null;
    footer?: React.ReactNode | React.ReactNode[] | null;
}

export const Neo4jProvider: React.FC<Neo4jProviderProps> = (props: Neo4jProviderProps) => {
    const configFromStorage: Neo4jConfig = (window.localStorage ? JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '{}') : {}) as Neo4jConfig

    const [ authenticating, setAuthenticating ] = useState<boolean>(true)
    const [ config, setConfig ] = useState<Neo4jConfig>(configFromStorage)
    const [ driver, setDriver ] = useState<Driver | undefined>(props.driver)

    const [ error, setError ] = useState<Error>()
    const [ database, setDatabase ] = useState<string | undefined>(props.database)


    const updateConnection = (config: Neo4jConfig) => {
        setConfig(config)
        setDatabase(database)
        setAuthenticating(true)

        const newDriver = createDriver(config.scheme, config.host, config.port, config.username, config.password)

        newDriver.verifyConnectivity()
            .then(() => {
                setDriver(newDriver)

                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config))
            })
            .catch(e => setError(e))
            .finally(() => setAuthenticating(false))
    }

    useEffect(() => {
        // Has Driver been Passed?
        if ( props.driver ) {
            props.driver.verifyConnectivity()
                .catch(e => setError(e))
                .finally(() => {
                    setDriver(props.driver)
                    setAuthenticating(false)
                })
        }
        // Has a connection string been provided to the url?
        else {
            setAuthenticating(false)
        }
    }, [driver])

    // Test driver passed as a prop or url search params
    useEffect(() => {
        if ( props.driver !== undefined)  {
            return
        }

        const searchParams = new URLSearchParams(window.location.search)

        // Attempt to connect from URL parameters
        let urlScheme, urlHost, urlPort

        if ( searchParams.has('url') ) {
            const url = searchParams.get('url')!

            const matches = url.match(/((neo4j|neo4j\+s|neo4j\+ssc|bolt|bolt\+s|bolt\+ssc):\/\/)([a-z0-9\.]+)(:([0-9]+))/)

            if (matches) {
                urlScheme = matches[2]
                urlHost = matches[3]
                urlPort = matches[5]
            }
        }

        if (urlScheme && urlHost && urlPort) {
            // Build Credentials
            const username = searchParams.get('user') || undefined
            const password = searchParams.get('pass') || undefined

            // Attempt to Connect
            const config: Neo4jConfig = {
                scheme: urlScheme || 'neo4j',
                host: urlHost || 'localhost',
                port: urlPort || 7687,
                username,
                password,
                database: searchParams.get('database') || undefined
            }

            updateConnection(config)
        }
    }, [ props.driver ])


    // Wait for effect to verify driver connectivity
    if ( authenticating ) {
        return(<div className="authenticating"></div>)
    }

    if ( !driver ) {
        const { title, logo, details, footer } = props;

        return (<Login
            error={error}
            title={title}
            logo={logo}
            details={details}
            footer={footer}
            showActive={props.showActive}
            showHost={props.showHost}
            showDatabase={props.showDatabase}
            onSubmit={updateConnection}
            {...props}
        />)
    }

    return (
        <Neo4jContext.Provider value={{ driver, config, database, updateConnection, setDatabase, }}>
            {props.children}
        </Neo4jContext.Provider>
    )
}
