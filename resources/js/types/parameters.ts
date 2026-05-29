export interface ParameterGroup {
    id: number;
    key: string;
    label: string;
    description: string | null;
    is_active: boolean;
    is_system: boolean;
    values_count: number;
    active_values_count: number;
}

export interface IndexParametersProps {
    groups: ParameterGroup[];
}

export type ModalState = { type: 'none' } | { type: 'create' } | { type: 'edit'; group: ParameterGroup } | { type: 'delete'; group: ParameterGroup };

export interface GroupFormData {
    key: string;
    label: string;
    description: string;
    is_active: boolean;
    [key: string]: string | boolean;
}

export interface GroupFormModalProps {
    group?: ParameterGroup | null;
    onClose: () => void;
}

export interface ParameterValue {
    id: number;
    group_id: number;
    value: string;
    label: string;
    order: number;
    is_active: boolean;
    metadata: string | null;
}

export interface ShowParametersProps {
    group: ParameterGroup;
    values: ParameterValue[];
}
