module.exports.createTagObject = (tagValueList) => {
    let tagGroupAndTagValues = {};
    tagValueList.forEach((tagValue) => {
        let absUrl = getTagAbsoluteUrl(tagValue);
        let url = absUrl || '';
        let slug = url ? url.split('/')[2] : '';
        if (tagGroupAndTagValues[tagValue.tagGroupAttributeType]) {
            tagGroupAndTagValues[tagValue.tagGroupAttributeType].push(
                {
                    tagValue: tagValue['tagValue'],
                    url,
                    slug
                })
        } else {
            tagGroupAndTagValues[tagValue.tagGroupAttributeType] = [{
                tagValue: tagValue['tagValue'],
                url,
                slug
            }]
        }

    });

    return tagGroupAndTagValues
};

function getTagAbsoluteUrl(tagValue) {
    return `/ts/${tagValue.id}/${tagValue.tagGroupTypeSlug}/${tagValue.valueSlug}`
}

    // def create_tag_dictionary(self, tag_values_list, tags_dict):
    //     if tag_values_list:
    //         for each_tag_value in tag_values_list:
    //             tag_value_dict = {'url': each_tag_value.get_absolute_url(), 'tag_value': each_tag_value.tag_value}
    //             tag_group = str(each_tag_value.tag_group.attribute_type)
    //             if each_tag_value.is_active:
    //                 if tags_dict.has_key(tag_group):
    //                     tags_dict[tag_group].append(tag_value_dict)
    //                 else:
    //                     tags_dict[tag_group] = [tag_value_dict]
    //     return tags_dict