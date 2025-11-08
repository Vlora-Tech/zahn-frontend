import React from 'react'
import { Button, type ButtonProps } from '@mui/material'

interface IButtonBlockProps extends ButtonProps {
    children?: React.ReactNode
    className?: string
    bgcolor?: string | undefined
}

const ButtonBlock: React.FC<IButtonBlockProps> = ({
    children,
    className="",
    sx = {},
    ...props
}) => {

    const variants = {
        outlined: {
            style: {
                // border: '1px solid #E7E7E7',
                // bgcolor: '#FAFAFA',
                // color: '#4F4F4F',
                // '&:hover': {
                //     bgcolor: '#F0F0F0',
                //     borderColor: '#D1D1D1',
                // },
            },
        },
        contained: {
            style: {
                // bgcolor: bgcolor || 'rgba(64, 103, 176, 1)',
                // color: '#fff',
                // '&:hover': {
                //     bgcolor: bgcolor || 'rgba(64, 103, 176, 1)',
                //     backgroundOpacity: '0.1',
                // },
            },
        },
        text: {
            style: {
                color: '#4F4F4F',
            },
        },
    }

    return (
        <Button
            disableElevation
            className={`${className}`}
            sx={{
                "& > .MuiButton-icon": {
                    marginRight: "8px"
                },
                textTransform: 'capitalize',
                height: '40px',
                padding: '8px auto',
                borderRadius: '8px',
                ...variants[props.variant || 'outlined'].style,
                ...sx,
            }}
            {...props}
        >
            {children}
        </Button>
    )
}

export default ButtonBlock
