import React, { useState } from 'react'
import { FormButton, FormInput, FormSelect } from './form-items'
import { schemes } from '../neo4j.constants'
import { Neo4jScheme } from '../neo4j-config.interface'

const schemeMap = schemes.map(scheme => ({
    key: scheme,
    id: scheme,
    value: scheme,
}))

interface LoginFormProps {
    classNames: Record<string, any>;
    scheme: Neo4jScheme;
    host: string;
    port: string | number;
    username: string;
    password: string;
    database: string;
    showHost: boolean;
    showDatabase: boolean;
    onSubmit: Function;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    classNames,
    onSubmit,
    showHost,
    showDatabase,
    ...props
}) => {
    const [scheme, setScheme] = useState<Neo4jScheme>(props.scheme || 'neo4j')
    const [host, setHost] = useState(props.host || 'localhost')
    const [port, setPort] = useState(props.port || 7687)
    const [username, setUsername] = useState(props.username || 'neo4j')
    const [password, setPassword] = useState(props.password || 'neo')
    const [database, setDatabase] = useState(props.database)

    const handleSchemeChange = selected => setScheme(selected.value)

    const handleSubmit = () => {
        onSubmit({ scheme, host, port, username, password, database })
    }

    return (
        <div>
            {(showHost === undefined || !!showHost) && <div className={classNames.loginServerGroup}>
                <FormSelect classNames={classNames} id="scheme" label="Scheme" options={schemeMap} value={scheme} setter={handleSchemeChange} />
                <FormInput classNames={classNames} id="host" label="Host" value={host} setter={setHost} />
                <FormInput classNames={classNames} id="port" label="Port" value={port} setter={setPort} />
            </div>}
            <FormInput classNames={classNames} id="username" label="Username" value={username} setter={setUsername} />
            <FormInput classNames={classNames} id="password" label="Password" value={password} setter={setPassword} type="password"/>
            { (showDatabase === undefined || !!showDatabase) && <FormInput classNames={classNames} id="database" label="Database" value={database} setter={setDatabase} />}

            <div className={classNames.formButtons}>
                <FormButton text="Connect to Neo4j" className={classNames.formButtonPrimary} onClick={handleSubmit} />
            </div>
        </div>
    )
}
