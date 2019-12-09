var Parties = window.Parties = {
    id: 0,
    ppp: [],
    rules: null
};

Parties.PrintRules = () => {
    if(this.rules == null)
        return "";
    var table = $('<table />').addClass('table table-striped table-bordered');
    var TH = "<th>Имя</th>";
    for( x = 0; x < this.ppp.length; x++)
    {
        TH += "<th title='" + this.ppp[x][1] + "'>" + x + "</th>";
    }
       TH += "<th></th>";
    table.append(TH);
    for(var x = 0; x < this.ppp.length; x++)
    {
        var ROW = "<tr><td title='" + this.ppp[x][2] + "'>" + this.ppp[x][1] + "</td>";
        for(var rx = 0; rx < this.ppp.length; rx++)
        {
            ROW += "<td>" + (this.rules[x][rx] == true
             ? "<span coord='" + x + "." + rx + "' class='btncheck glyphicon glyphicon-ok green' title='" + this.ppp[x][1] + " может дарить " + this.ppp[rx][1] + "'>" 
             : "<span coord='" + x + "." + rx + "' class='btncheck glyphicon glyphicon-minus white'>") + "</td>"
        }
        ROW += "<td><span id='" + x + "' class='glyphicon glyphicon-remove red btnremove' title='Вообще не будет'></span></td></tr>";
        table.append(ROW);
    }
    return table;
};

Parties.RebuildRules = () => {
    var vsize = this.ppp.length;
    if(vsize == 0)
        return this.PrintRules();
    if(this.rules == null) {
        this.rules = [[true]];
        return this.PrintRules();
    }
    for (var x = 0; x < vsize - 1; x++) {
        this.rules[x].push(true);
    }
    this.rules.push([]);
    for (var x = 0; x < vsize; x++) {
        this.rules[vsize - 1].push(true);
    }
    return this.PrintRules();
};

Parties.TriggerRule = (x, y) => {
    if(x >= this.ppp.length || y >= this.ppp.length)
        return;
    this.rules[x][y] = !this.rules[x][y];
    if(x != y)
    {
        this.rules[y][x] = !this.rules[y][x];
    }
    return this.PrintRules();
};

Parties.addParty = (pname, pemail) => {
    pname = pname.trim();
    pemail = pemail.trim();
    if (pname.length > 0) {
        this.ppp.push([this.id++, pname, pemail]);
        return this.RebuildRules()
    }

    return "";
};

Parties.RemovePart = (idx) => {
    if(idx >= this.ppp.length)
        return;
    var vsize = this.ppp.length;
    this.ppp.splice(idx, 1);
    if(this.ppp.length == 0)
    {
        this.rules = null;
        return "";
    }
    for (var x = 0; x < vsize; x++) {
        this.rules[x].splice(idx, 1);
    }
    this.rules.splice(idx, 1);
    return this.PrintRules();
};

Parties.RecursiveGenerate = (idx_next, morph, res) => {
    var vIdx = [];
    for (var y = 0; y < this.ppp.length; y++) {
        if (this.rules[idx_next][morph[y]] == true && $.inArray(morph[y], res) < 0)
            vIdx.push(morph[y]);
    }

    if (vIdx.length == 0) {
        if (res.length != this.ppp.length - 1) {
            return [false, res];
        } else {
            res.push(idx_next);
            return [true, res];
        }
    }

    for (var x = 0; x < vIdx.length; x++) {
        res.push(idx_next);
        var rPair = this.RecursiveGenerate(vIdx[x], morph, res);
        if (rPair[0] == true) {
            return [true, rPair[1]];
        } else {
            res.pop();
        }
    }

    return [false, res];
};

Parties.CheckGraph = () => {
    for (var x = 0; x < this.ppp.length; x++) {
        var entries = 0;
        for (var y = 0; y < this.ppp.length; y++) {
            if (this.rules[x][y] == true)
                entries++;
        }

        if(entries < 2)
            return false;
    }

    return true;
}

Parties.Generate = () => {
    if (this.ppp.length == 0 || this.ppp.length < 3)
        return false;

    if(!this.CheckGraph())
        return false;

    shuffle(this.ppp);
    var morph = new Array(this.ppp.length);
    for (var i = 0; i < this.ppp.length; i++) {
        morph[this.ppp[i][0]] = i;
    }

    var ret = this.RecursiveGenerate(morph[0], morph, []);
    if (!ret[0] || ret[1].length == 0 || ret[1].length != this.ppp.length)
        return false;

    var res = [];
    for (var i = 0; i < this.ppp.length - 1; i++) {
        res.push( [ this.ppp[morph[ret[1][i]]], this.ppp[morph[ret[1][i + 1]]] ] );
    }

    res.push([ this.ppp[ morph[ret[1][ret[1].length - 1]]], this.ppp[morph[ret[1][0]]]]);
    this.ppp = [];
    this.rules = null;
    this.id = 0;
    return res;
};

var shuffle = (o) => {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);

    return o;
}

var CheckClick = () => {
    var x = $(this).attr('coord');
    var cc = x.split('.');
    var ph = Parties.TriggerRule(cc[0], cc[1]);
    $('.parties').html(ph);
    $('.btncheck').click(CheckClick);
    $('.btnremove').click(CheckRemove);
}

var CheckRemove = () => {
    var ph = Parties.RemovePart($(this).attr('id'));
    $('.parties').html(ph);
    $('.btncheck').click(CheckClick);
    $('.btnremove').click(CheckRemove);
}

$(window).load(() => {
    $('.ok').click(() => {
        var input_name = $('.newOne #pname');
        var input_email = $('.newOne #pemail');
        var ph = Parties.addParty(input_name.val(), input_email.val());
        $('.parties').html(ph);
        $('.btncheck').click(CheckClick);
        $('.btnremove').click(CheckRemove);
        input_name.val('');
        input_email.val('');
        input_name.focus();
    });

    $('.runRaffle').click(() => {
        var results = Parties.Generate();
        if (!results) {
            $('.notice').show();
            return;
        }
        $('.notice').hide();
        // $('.parties').html("");
        for (var i = 0; i < results.length; i++) {
            // send mail
            var data = {
                sendername: results[i][0][1],
                sendermail: results[i][0][2],
                receivername: results[i][1][1],
                _token: '{{ csrf_token() }}'
            };
            $.post('{{ url("adm") }}', data, function(msg) {}, 'json');
        }
        $('.bg-info').html("Вроде все отправили. Вперед! Проверять почту!");
    });
});
