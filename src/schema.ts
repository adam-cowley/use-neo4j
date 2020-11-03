import { useEffect, useState } from "react"
import { useReadCypher } from "./cypher"

export interface PropertySchema {
    existence: boolean;
    type: string;
    array: boolean;
}

export interface LabelSchema {
    label: string;
    type: 'node';
    labels: string[];
    count: number;
    relationships: RelationshipTypeSchema[];
    properties: Record<string, PropertySchema>;
}

export interface RelationshipTypeSchema {
    type: string;
    count: number;
    properties: Record<string, PropertySchema>;
    direction?: 'in' | 'out'
}
export interface UseSchemaOutput {
    loading: boolean;
    labels: LabelSchema[];
    types: RelationshipTypeSchema[];
    database?: string;
}

function toPropertySchema(properties: Record<string, Record<string, any>>): Record<string, PropertySchema> {
    const ordered = Object.entries(properties)
        .sort(([ a ], [ b ]) => a < b ? -1 : 1)
        .map(([ key, value ]) => [ key, value as PropertySchema ])

    return Object.fromEntries(ordered)

}

function toLabelSchema(label: string, input: Record<string, any>): LabelSchema {
    return {
        ...input,
        label,
        relationships: Object.entries(input.relationships)
            .map(([ key, value ]) => toRelationshipTypeSchema(key, value as Record<string, any>))
            .sort((a, b) => a.type < b.type ? -1 : 1),
        properties: toPropertySchema(input.properties),
        count: input?.count.toNumber(),
    } as LabelSchema
}

function toRelationshipTypeSchema(type: string, input: Record<string, any>): RelationshipTypeSchema {
    return {
        ...input,
        type,
        count: input.count?.toNumber(),
        properties: toPropertySchema(input.properties),
    } as RelationshipTypeSchema
}

export function useSchema(specificDatabase?: string): UseSchemaOutput {
    const { loading, first, database } = useReadCypher('call apoc.meta.schema', {}, specificDatabase)
    const [ labels, setLabels ] = useState<LabelSchema[]>([])
    const [ types, setTypes ] = useState<RelationshipTypeSchema[]>([])

    useEffect(() => {
        if ( first ) {
            setLabels(Object.entries(first!.get('value'))
                .filter(([ key, value ]) => (value as Record<string, any>).type === 'node')
                .map(([ key, value ]) => toLabelSchema(key, value as Record<string, any>))
                .sort((a, b) => a.label < b.label ? -1 : 1)
            )

            setTypes( Object.entries(first!.get('value'))
                .filter(([ key, value ]) => (value as Record<string, any>).type === 'relationship')
                .map(([ key, value ]) => toRelationshipTypeSchema(key, value as Record<string, any>))
                .sort((a, b) => a.type < b.type ? -1 : 1)
            )
        }
    }, [first])

    return {
        loading,
        database,
        labels,
        types,
    }
}
