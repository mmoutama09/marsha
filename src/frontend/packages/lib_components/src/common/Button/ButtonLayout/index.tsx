import { Box, Text, ResponsiveContext } from 'grommet';
import React, { useContext } from 'react';
import styled from 'styled-components';

import type { SvgProps } from '../../../common/SVGIcons';

import { Badge } from './Badge';

interface ResponsiveProps {
  screenSize: string;
}

const IconBox = styled(Box)`
  align-items: center;
  display: block;
  height: 100%;
  justify-content: center;
  margin: ${({ screenSize }: ResponsiveProps) =>
    screenSize === 'small' ? '0 6px' : '0 8px'};
  min-height: 0;
  position: relative;
  text-align: center;
`;

const TextBox = styled(Box)`
  display: flex;
  text-align: center;
`;

const StyledText = styled(Text)`
  font-weight: normal;
  font-size: ${({ screenSize }: ResponsiveProps) =>
    screenSize === 'small' ? '0.7rem' : '0.9rem'};
  letter-spacing: ${({ screenSize }: ResponsiveProps) =>
    screenSize === 'small' ? '-0.3px' : '-0.13px'};
  line-height: ${({ screenSize }: ResponsiveProps) =>
    screenSize === 'small' ? '0.8rem' : '0.9rem'};
`;

export interface ButtonLayoutSubComponentProps {
  badge?: string;
  Icon?: React.FC<SvgProps>;
  label?: string;
}

interface ButtonLayoutProps extends ButtonLayoutSubComponentProps {
  reversed?: boolean;
  reversedColor: string;
  tintColor: string;
  textColor: string;
}

export const ButtonLayout = ({
  badge,
  Icon,
  label,
  reversed,
  reversedColor,
  tintColor,
  textColor,
}: ButtonLayoutProps) => {
  const size = useContext(ResponsiveContext);

  const iconColor = reversed ? reversedColor : tintColor;
  const rectColor = reversed ? tintColor : undefined;

  return (
    <Box align="center" flex height="100%">
      {Icon && (
        <IconBox screenSize={size}>
          <Icon iconColor={iconColor} focusColor={rectColor} height="100%" />
          {badge && <Badge value={badge} />}
        </IconBox>
      )}

      {label && (
        <TextBox align="center" margin={{ top: '6px' }}>
          <StyledText color={textColor} screenSize={size}>
            {label}
          </StyledText>
        </TextBox>
      )}
    </Box>
  );
};
