import { useContext } from 'react';
import FieldArrayContext from '../FieldArrayContext';

const useFieldArrayScope = () => useContext(FieldArrayContext);

export default useFieldArrayScope;
