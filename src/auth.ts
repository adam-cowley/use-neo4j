import { useReadCypher } from "./cypher"

interface Role {
    role: string;
    members: string[];
}

interface UseRolesOutput {
    loading: boolean;
    error?: Error;
    roles?: Role[];
}

export function useRoles(): UseRolesOutput {
    const { loading, error, records } = useReadCypher('SHOW POPULATED ROLES WITH USERS')

    const roles = records?.map(row => [ row.get('role'), row.get('member') ])
        .reduce((acc: Role[], row: string[]) => {
            const [ name, member ] = row

            const index = acc.findIndex(role => role.role === name)

            if ( index > -1 ) {
                (acc[ index ] as Role).members.push(member)
                return acc
            }

            return acc.concat({ role: name, members: [ member ] })

        }, [])

    return {
        loading,
        error,
        roles,
    }
}

interface User {
    user: string;
    roles: string[]
    passwordChangeRequired: boolean;
    suspended: boolean;
}

interface UseUsersOutput {
    loading: boolean;
    error?: Error;
    users?: User[];
}

export function useUsers(): UseUsersOutput {
    const { loading, error, records } = useReadCypher('SHOW USERS', {}, 'system')

    const users = records?.map(row => ({
        user: row.get('user'),
        roles: row.get('roles'),
        passwordChangeRequired: row.get('passwordChangeRequired'),
        suspended: row.get('suspended'),
    }))

    return {
        loading,
        error,
        users,
    }
}
