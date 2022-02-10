const AmoCRM = require( 'amocrm-js' );
const crm = new AmoCRM({
    domain: 'sardorcreater', // может быть указан полный домен вида domain.amocrm.ru, domain.amocrm.com

    auth: {
        client_id: '10a15f27-d4a6-40aa-a4c5-031e47252d45', // ID интеграции
        client_secret: 'EOABvy8eoDH7wjao0hgmGgsi2KzRwCsKo1PYb8Mj71MtptfWuCurlC1gG2Kv9bsM', // Секретный ключ
        redirect_uri: 'https://sardor.ru', // Ссылка для перенаправления
        code: 'def50200aac8fc7c297f60e8c8ce0e523bbccd0ed2fe4a0c2b60f9247d5c718180f79eec430ea6e649f6fd84ea375cb4ac7d0cfb7488e949cd4917938f02d7a3d4e50727e2dd0374e5f8e9fd129da82a4c9795a8d61d35f7b433ba18e04ee171604f00fda50f7949f4c82bfdea12f0775c237e331e2c0e036221dc7ddf6eed58b017c59ce01b556302159cbdf1ce8ed5245d6ca4209dc622519b76e81d461e38e12956b2384ae1383ef33d120ee0e45b5f200bb4241ae6a58ef0b7d8df472d130aa510ba65b29b8dfd7e91de9e1d689c736b0633cd4c7311a17c4f6a0a401593a8e6606d969c8e754572070091cc49331e1bd69f96a4078e4797d6a46928e372964eb068176778e0c55469237cd8303634ae58222ac274d454b498cb17686ef318546a5757c10d0c77c6f1b4373790a611b3139cc91731b983732002cdade37b29c787b687d6fa596c005bd4a4b0f449bf75a37500c7f78cf79354fda97cb0e55a9427d1c9b695c974b0167a13345b4aee1ade279135a51fec75648cfaf274981390c0298d9184fabe85fafeb53298d364f4b02ce5fac0ab6b03e8f2845acb11cec13233285f17e64e44d7649e15b8ef681bdde71f9a9f6a355807' // Код авторизации
        // server: {
        //     port: 3001
        // }
 },
});
(async ()=>{
    let isUnFinish = true;
    let page = 0;
    const limit = 25;
    let allData = [];
    while (isUnFinish){
        page++;
        let res = await crm.request.get('/api/v4/contacts', {'with':'leads', page, limit});
        let data = res.data;
        if (!data){
            break;
        }
        isUnFinish = limit === data._embedded.contacts.length;
        allData = [...allData, ...data._embedded.contacts];
    }
    // console.log(allData);
    let arr = [];
    allData.forEach((element)=>{
        if (element._embedded.leads.length === 0) arr.push(element.id);
    })
    if (arr.length !== 0){
        const response = await crm.request.post( '/api/v4/leads', [{}]);
        let leadsID = response.data._embedded.leads[0].id;
        await crm.request
            .post( '/api/v4/tasks',
                [
                    {
                        "text": "Контакт без сделок",
                        "complete_till": 1588885140,
                        "entity_id": leadsID,
                        "entity_type": "leads",
                        "request_id": "example"
                    }
                ]
            )

        const postData = arr.map(el=>{
            return {
                "to_entity_id": el,
                "to_entity_type": "contacts",
                "metadata": null
            }
        })
        await crm.request.post(`/api/v4/leads/${leadsID}/link` ,postData)
    }
})();

