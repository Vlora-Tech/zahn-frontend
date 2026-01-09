import React from 'react'
import icons from '../assets/sprite.svg'

interface SvgIconProps {
    icon: string
    width?: string
    height?: string
    className?: string
    color?: string
}

const SvgIcon: React.FC<SvgIconProps> = ({
    icon,
    width = '24px',
    height = '24px',
    color = 'currentColor',
    className = '',
}) => {
    return (
        <svg width={width} height={height} className={className} style={{ color }}>
            <use xlinkHref={`${icons}#${icon}`} />
        </svg>
    )
}

export default SvgIcon
