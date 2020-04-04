import humanize from 'underscore.string/humanize';
import Button from '@material-ui/core/Button';
import Information from 'mdi-material-ui/Information';
import Wikipedia from 'mdi-material-ui/Wikipedia';
import Compass from 'mdi-material-ui/Compass';
import LinkBoxVariant from 'mdi-material-ui/LinkBoxVariant';
import { H2, ContentBox } from './Typography';

const iconMap = {
    official_website: Information,
    wikipedia: Wikipedia,
    wikivoyage: Compass,
};

const icon = i => {
    const Icon = i in iconMap ? iconMap[i] : LinkBoxVariant;
    return <Icon />;
};

export default ({ doc }) => {
    const link = i => {
        if (i in doc.links) {
            return (
                <Button
                    key={i}
                    color="primary"
                    href={doc.links[i]}
                    startIcon={icon(i)}
                    style={{ marginRight: '1em' }}
                >
                    {humanize(i)}
                </Button>
            );
        }
        return '';
    };

    return (
        <>
            {'links' in doc && (
                <ContentBox>
                    <H2>Links</H2>
                    {['official_website', 'wikipedia', 'wikivoyage'].map(link)}
                </ContentBox>
            )}
        </>
    );
};
