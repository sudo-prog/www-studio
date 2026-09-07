import React from 'react';

const FontAwesome = ({name, classname=''}) => {
    return (
        <i className={`fa fa-${name} ${classname}`} />
    )
};

// export default FontAwesome;
export { FontAwesome as InkMeFontAwesome };
