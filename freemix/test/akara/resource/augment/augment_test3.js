{
    "__comment": "curl --request POST --data-binary '@-'' http://transformer.zepheira.com:8883/augment.freemix.json < ~/dev/zepheira/freemix-akara/test/resource/augment/augment_test3.js",
    "items": [
        {
            "id": "_1",
            "label": "_1",
            "ole": ["1", "2", "3"],
            "aha": "Ezra"
        },
        {
            "id": "_2",
            "label": "_2",
            "ole": ["1", "2"],
            "aha": "Christopher"
        }
    ],
    "data_profile": {
        "original_MIME_type": "application/json",
        "label": "Augmentation test 3",
        "Akara_MIME_type_guess": "application/json",
        "properties": [
        {
            "property": "ole",
             "enabled": true,
             "label": "Ole",
             "tags": ["property:type=shredded_list"]
        },
        {
            "property": "aha",
             "enabled": true,
             "label": "Aha",
             "tags": ["property:type=text"]
        },
        {
            "property": "label",
             "enabled": true,
             "label": "label",
             "tags": ["property:type=text"]
        },
        {
            "property": "id",
             "enabled": true,
             "label": "id",
             "tags": ["property:type=text"]
        }
        ]
    }
}
