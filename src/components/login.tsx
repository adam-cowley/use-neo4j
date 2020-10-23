import React, { useState } from 'react'
import { Neo4jScheme, Neo4jConfig } from '../neo4j-config.interface'
import { globalClassNames } from '../neo4j.constants'
import { LoginDesktop } from './login-desktop'
import { LoginForm } from './login-form'


interface LoginProps {
    error?: Error;
    onSubmit: (config: Neo4jConfig) => void;
    scheme?: Neo4jScheme;
    host?: string;
    port?: string | number;
    username?: string;
    password?: string;
    database?: string;

    showHost?: boolean;
    showActive?: boolean;
    showProject?: boolean;
    showDatabase?: boolean;

    title?: React.ReactNode | React.ReactNode[] | null;
    logo?: React.ReactNode | React.ReactNode[] | null;
    details?: React.ReactNode | React.ReactNode[] | null;
    footer?: React.ReactNode | React.ReactNode[] | null;
}

export const Login: React.FC<LoginProps> = ({ error, onSubmit, ...props }) => {
    // @ts-ignore
    const [showProjectForm, setShowProjectForm] = useState((props.showProject || props.showProject === undefined) && window.neo4jDesktopApi)

    // TODO: Dynamic classes
    const classNames = globalClassNames.semantic

    let form

    if ( showProjectForm ) {
        form = <LoginDesktop classNames={classNames} showActive={props.showActive} hide={() => setShowProjectForm(false)} onSubmit={onSubmit} />
    }
    else {
        // @ts-ignore
        form = <LoginForm classNames={classNames} showHost={props.showHost} showDatabase={props.showDatabase} onSubmit={onSubmit} {...props} />
    }

    return (
        <div className={classNames.login}>
            <div className={classNames.loginContainer}>
                {props.title}
                <form className={classNames.form}>
                    {props.logo}
                    {error && (<div className={classNames.formError}>{error.message}</div>)}

                    {form}

                    {props.details}
                </form>

                {props.footer}
            </div>
        </div>

    )
}