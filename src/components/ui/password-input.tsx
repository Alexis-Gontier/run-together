"use client"

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/shadcn-ui/input-group";
import { useToggle } from "@/hooks/use-toggle";
import {
    Eye,
    EyeOff
} from "lucide-react";

type PasswordInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function PasswordInput({ value, onChange, placeholder }: PasswordInputProps) {

    const { value: isPasswordVisible, toggle: togglePasswordVisibility } = useToggle(false)

    return (
        <InputGroup>
            <InputGroupInput
                type={isPasswordVisible ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    variant="outline"
                    size="icon-xs"
                    onClick={togglePasswordVisibility}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    className="cursor-pointer"
                >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}