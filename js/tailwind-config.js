tailwind.config = {
    theme: {
        extend: {
            colors: {
                cetecBlue: '#011E62',
                cetecBlueDark: '#011545',
                cetecGreen: '#6EBE44',
                cetecGreenDark: '#559930',
                cetecOrange: '#F37021',
                bgDashboard: '#F3F6F9'
            },
            fontFamily: {
                sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif']
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'scale(0.98)' },
                    '100%': { opacity: '1', transform: 'scale(1)' }
                }
            }
        }
    }
};
