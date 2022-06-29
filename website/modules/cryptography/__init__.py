import math
import random

from .zh_char import zh_char
TABLE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

class cryp:
    def encode(_typ,text):
        if _typ == 'zh':
            return encode(text,zh_char,digit_zh)
        elif _typ == '64':
            return encode(text,TABLE64,digit_64)

    def decode(_typ,text):
        if _typ == 'zh':
            return decode(text,zh_char,t_map_zh,digit_zh)
        elif _typ == '64':
            return decode(text,TABLE64,t_map_64,digit_64)

def chaosTable(t):
    # 返回一个经过洗牌的数组
    x = [i for i in t]
    random.shuffle(x)
    return x

def makeMap(t):
    # 返回一个以阵列的(值:索引)为键值对的字典
    return {s: i for i, s in enumerate(t)}

t_map_zh = makeMap(zh_char)
t_map_64 = makeMap(TABLE64)
digit_zh = len(zh_char)
digit_64 = len(TABLE64)

CONST_e = 2.71828182846
CONST_alpha = 1 / 137

def fill_zero(s,d):
    # 补偿 0
    while(len(s) < d):
        s = f'0{s}'
    return s

def safe_idx(n: int,d: int) -> int:
    # 确保 n 能作为 d 以内的索引值
    while n > d - 1:
        n -= d
    while n < 0:
        n += d
    return n

def _b(n: int, table, digit) -> str:
    # 10 进制转 digit 进制
    if not n:
        return '0'
    r = []
    while n > 0:
        r.append(table[n % digit])
        n //= digit
    return ''.join(r[::-1])

def _d(s: str, t_map, digit) -> int:
    # digit 进制转 10 进制
    i = 0
    for c in s:
        i = i * digit + t_map[c]
    return i

def _en_b64(n: int) -> str:
    return _b(n,TABLE64,64)

def _de_b64(s: str) -> int:
    return _d(s,t_map_64,64)

class easy_cryp:
    def encode(s):
        return mask(s,TABLE64,64)
    def decode(s):
        return unmask(s,TABLE64,64)

def mask(s: str, table, digit) -> str:
    # 生成 2 个种子，seed1 为字串长度的 CONST_alpha 次方根，seed2 为随机数 0 至 digit - 1 的随机数
    seed1 = (len(s) + 1) ** CONST_alpha
    seed2 = random.randint(0,digit - 1)
    # 以 seed1 作为种子
    random.seed(seed1)
    # 生成种子要埋藏的位置
    rt = random.randint(0,len(s))
    # 对 table 进行洗牌，并生成相应的 t_table
    self_TABLE = chaosTable(table)
    self_T_MAP = makeMap(self_TABLE)
    # 生成重新排序的依据 sf
    sf = chaosTable(range(len(s)+1))
    # 以 seed1 * seed2 的 e 次方根作为种子
    random.seed((seed1 * seed2) ** (1 / CONST_e))
    # 把 digit 进制字串转换以每个字符的 10 进制数字组成的阵列
    s = [self_T_MAP[i] for i in s]
    # 叠加处理
    x = []
    for i in s:
        if len(x):
            i += x[-1]
        x.append(i)
    # 模糊处理
    s = [i + random.randint(-32,31) for i in x]
    # 逆序排列
    s.reverse()
    # 放入种子
    s.insert(rt,seed2)
    # 重新排列
    x = list(s)
    j = 0
    for i in sf:
        s[j] = x[i]
        j += 1
    # 重置 random 的种子
    random.seed()
    # 返回安全索引的 digit 进制字串
    return ''.join([self_TABLE[safe_idx(i,digit)] for i in s])

def unmask(s: str, table, digit) -> str:
    # 获取 seed1
    seed1 = len(s) ** CONST_alpha
    # 以 seed1 作为种子
    random.seed(seed1)
    # 生成 rt, self_TABLE, self_T_MAP, sf
    rt = random.randint(0,len(s)-1)
    self_TABLE = chaosTable(table)
    self_T_MAP = makeMap(self_TABLE)
    sf = chaosTable(range(len(s)))
    # 恢复顺序
    x = [i for i in s]
    j = 0
    for i in sf:
        x[i] = s[j]
        j += 1
    # 获取 seed2
    seed2 = self_T_MAP[x.pop(rt)]
    # 逆序排列
    x.reverse()
    # 以 seed1 * seed2 的 e 次方根作为种子
    random.seed((seed1 * seed2) ** (1 / CONST_e))
    # 字元转数字
    x = [self_T_MAP[i] for i in x]
    # 解除模糊处理
    x = [i - random.randint(-32,31) for i in x]
    # 解除叠加处理
    s = []
    j = 0
    for i in x:
        i -= j
        j += i
        s.append(i)
    # 重置 random 的种子
    random.seed()
    # 返回安全索引的 digit 进制字串
    return ''.join([self_TABLE[safe_idx(i,digit)] for i in s])

def encode(s,table,digit):
    if not s:
        return ''
    # 把每一个字转换成数字（ASCII/unicode）
    s = [ord(i) for i in s]
    # 如果没有双位元组字元集采用更强的压缩（省略单位元组二进制中的前8位0），d 是 digits，位数
    if max(s) < 128:
        d = 8
    else:
        d = 16
    # 把所有字元集的二进制拼接在一起
    s = f'0b{"".join([fill_zero(bin(i)[2:],d) for i in s])}'
    # 转为十进制
    s = int(s,2)
    # 转为 digit 进制，并进行第(1)次遮罩
    s = _b(s,table,digit)
    s = mask(s,table,digit)
    # 储存加密的压缩模式（单/双位元组）在密文的末端
    r = 2 * random.randint(0,32)
    # 如果是单位元组，该值为单数
    if d == 8:
        r -= 1
    s = f'{s}{table[r]}'
    # 进行第(2)(3)(4)次遮罩
    for i in range(3):
        s = mask(s,table,digit)
    return s

def decode(s,table,t_map,digit):
    if not s:
        return ''
    # 解除第(2)(3)(4)次遮罩
    for i in range(3):
        s = unmask(s,table,digit)
    s = [i for i in s]
    # 弹出密文末端的压缩模式的信息，并判断
    if t_map[s.pop()] % 2:
        d = 8
    else:
        d = 16
    # 解除第(1)次遮罩后，转为十进制，再转为二进制
    s = unmask(s,table,digit)
    s = bin(int(_d(s,t_map,digit)))[2:]
    # 补偿头部缺失的 0
    s = f'{"0" * (d * math.ceil(len(s) / d) - len(s))}{s}'
    r = []
    i = len(s)
    # 每隔 8 或 16 位分割为一段，并从二进制转化为字元，存入 r
    while i > 0:
        r.append(chr(int(f'0b{s[i-d:i]}',2)))
        i -= d
    # 连接 r 中的所有字元
    return ''.join(r[::-1])