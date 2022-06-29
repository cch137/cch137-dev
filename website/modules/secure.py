from werkzeug.user_agent import UserAgent
from werkzeug.utils import cached_property
from ua_parser import user_agent_parser
from urllib.parse import unquote

class ParsedUserAgent(UserAgent):
    @cached_property
    def _details(self):
        return user_agent_parser.Parse(self.string)

    @property
    def platform(self):
        return self._details['os']['family']

    @property
    def browser(self):
        return self._details['user_agent']['family']

    @property
    def version(self):
        return '.'.join(
            part
            for key in ('major', 'minor', 'patch')
            if (part := self._details['user_agent'][key]) is not None
        )

def clean_dict(d):
    nk = []
    for i in d.keys():
        if isinstance(d[i],dict):
            d[i] = clean_dict(d[i])
            if not len(d[i].keys()):
                d[i] = None
        if d[i] == None:
            nk.append(i)
    for i in nk:
        del d[i]
    return d

def dict_url_decode(x: dict):
    for i in x:
        x[i] = unquote(x[i])
    return x

def identity_parser(request):
    parsed_ua = ParsedUserAgent(request.headers.get('User-Agent'))
    return {
        'ip': request.headers.get('X-Forwarded-For') or request.environ.get('HTTP_X_FORWARDED_FOR') or request.remote_addr,
        'ua': {
            'platform'   : parsed_ua.platform,
            'browser'    : parsed_ua.browser,
            'version'    : parsed_ua.version,
            'language'   : parsed_ua.language
        }
    }

def request_parser(request,response):
    try:
        j = request.json
    except Exception:
        j = None
    data = {
        'url': unquote(request.path),
        'method': request.method,
        'status': response.status,
        'http_referer': request.environ.get('HTTP_REFERER'),
        'form': dict_url_decode(dict(request.form)),
        'args': dict_url_decode(dict(request.args)),
        'json': j,
        'cookies': dict_url_decode(dict(request.cookies))
    }
    id_parsed = identity_parser(request)
    for i in id_parsed:
        data[i] = id_parsed[i]
    return clean_dict(data)

import random
from .cryptography import TABLE64 as b64char

def b64_code(d=8):
    return ''.join([random.choice(b64char) for i in range(d)])

def spawn_sessions_id():
    return b64_code(16)
