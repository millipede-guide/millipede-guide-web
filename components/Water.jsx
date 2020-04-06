import LocationCards from './LocationCards';
import { H2, ContentBox } from './Typography';

export default ({ doc }) => (
    <>
        {'water' in doc && doc.water.length > 0 && (
            <ContentBox>
                <H2>Water Source</H2>
                <LocationCards items={doc.water} keys={['type', 'source', 'potable', 'treated']} />
            </ContentBox>
        )}
    </>
);