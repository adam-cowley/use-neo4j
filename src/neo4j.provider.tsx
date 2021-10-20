import React, { useEffect, useState } from 'react'
import { auth, Driver } from 'neo4j-driver'
import { Login } from './components/login'

import { Neo4jContext } from './neo4j.context'
import { createDriver } from './driver'
import { Neo4jConfig, Neo4jScheme } from './neo4j-config.interface'

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
    const [ authenticating, setAuthenticating ] = useState<boolean>(true)
    const [ config, setConfig ] = useState<Neo4jConfig>({} as Neo4jConfig)
    const [ driver, setDriver ] = useState<Driver | undefined>(props.driver)

    const [ error, setError ] = useState<Error>()
    const [ database, setDatabase ] = useState<string | undefined>(props.database)

    const updateConnection = (config: Neo4jConfig) => {
        setConfig(config)
        setDatabase(database)

        const newDriver = createDriver(config.scheme, config.host, config.port, config.username, config.password)

        newDriver.verifyConnectivity()
            .then(() => setDriver(newDriver))
            .catch(e => setError(e))
    }

    // Test driver passed as a prop
    useEffect(() => {
        if ( props.driver ) {
            props.driver.verifyConnectivity()
                .catch(e => setError(e))
                .finally(() => {
                    setDriver(props.driver)
                    setAuthenticating(false)
                })
        }
        else {
            setAuthenticating(false)
        }
    }, [driver])

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
